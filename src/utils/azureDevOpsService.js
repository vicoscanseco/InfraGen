const ADO_API_VERSION = '7.1'
const NULL_OID = '0000000000000000000000000000000000000000'

/**
 * Normaliza la URL de organización ADO.
 * Acepta "myorg" o "https://dev.azure.com/myorg".
 */
const buildOrgUrl = (org) => {
  if (/^https?:\/\//i.test(org)) return org.replace(/\/$/, '')
  return `https://dev.azure.com/${org}`
}

/** Codifica el contenido a Base64 preservando UTF-8. */
const toBase64 = (str) => btoa(unescape(encodeURIComponent(str)))

/** Cabecera de autenticación Basic para PAT de Azure DevOps. */
const authHeader = (pat) => `Basic ${btoa(`:${pat}`)}`

/**
 * Verifica que las credenciales y el repositorio sean accesibles.
 * @returns {Promise<{ok: boolean, message: string}>}
 */
export const testConnection = async ({ organization, project, repository, pat }) => {
  const orgUrl = buildOrgUrl(organization)
  const url = `${orgUrl}/${encodeURIComponent(project)}/_apis/git/repositories/${encodeURIComponent(repository)}?api-version=${ADO_API_VERSION}`

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: authHeader(pat),
        'Content-Type': 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return { ok: true, message: `Conectado a "${data.name}" correctamente.` }
    }

    if (response.status === 401) return { ok: false, message: 'Token inválido o sin permisos suficientes.' }
    if (response.status === 404) return { ok: false, message: 'Repositorio, proyecto u organización no encontrado.' }

    return { ok: false, message: `Error ${response.status}: ${response.statusText}` }
  } catch {
    return { ok: false, message: 'No se pudo conectar. Verifica la URL de organización y tu conexión a internet.' }
  }
}

/**
 * Obtiene el objectId del último commit en la rama especificada.
 * Devuelve NULL_OID si la rama no existe (repositorio vacío o rama nueva).
 */
const getLastCommitOid = async ({ orgUrl, project, repository, branch, pat }) => {
  const url = `${orgUrl}/${encodeURIComponent(project)}/_apis/git/repositories/${encodeURIComponent(repository)}/refs?filter=heads/${branch}&api-version=${ADO_API_VERSION}`

  const response = await fetch(url, {
    headers: { Authorization: authHeader(pat) }
  })

  if (!response.ok) throw new Error(`Error al obtener refs: ${response.status} ${response.statusText}`)

  const data = await response.json()
  const ref = data.value?.find(r => r.name === `refs/heads/${branch}`)
  return ref?.objectId ?? NULL_OID
}

/**
 * Sube o actualiza múltiples archivos en el repositorio ADO en un único commit.
 * @param {object} settings - { organization, project, repository, branch, pat }
 * @param {Array<{path: string, content: string}>} files - Archivos a subir
 * @param {string} commitMessage
 * @returns {Promise<{ok: boolean, message: string, commitUrl?: string}>}
 */
export const pushFiles = async ({ organization, project, repository, branch, pat }, files, commitMessage = 'chore: actualizar infraestructura Bicep desde InfraGen') => {
  const orgUrl = buildOrgUrl(organization)

  try {
    const oldObjectId = await getLastCommitOid({ orgUrl, project, repository, branch, pat })
    const changeType = oldObjectId === NULL_OID ? 'add' : 'edit'

    const pushUrl = `${orgUrl}/${encodeURIComponent(project)}/_apis/git/repositories/${encodeURIComponent(repository)}/pushes?api-version=${ADO_API_VERSION}`

    const body = {
      refUpdates: [{ name: `refs/heads/${branch}`, oldObjectId }],
      commits: [{
        comment: commitMessage,
        changes: files.map(({ path, content }) => ({
          changeType,
          item: { path: path.startsWith('/') ? path : `/${path}` },
          newContent: { content: toBase64(content), contentType: 'base64Encoded' }
        }))
      }]
    }

    const response = await fetch(pushUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader(pat),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })

    if (response.ok) {
      const data = await response.json()
      const commitId = data.commits?.[0]?.commitId
      const commitUrl = `${orgUrl}/${encodeURIComponent(project)}/_git/${encodeURIComponent(repository)}/commit/${commitId}`
      return { ok: true, message: 'Archivos guardados en Azure DevOps correctamente.', commitUrl }
    }

    if (response.status === 401) return { ok: false, message: 'Token inválido o sin permisos de escritura.' }
    if (response.status === 403) return { ok: false, message: 'Sin permisos para escribir en este repositorio.' }

    const errorData = await response.json().catch(() => null)
    const detail = errorData?.message || response.statusText
    return { ok: false, message: `Error al guardar: ${detail}` }
  } catch (error) {
    return { ok: false, message: `Error inesperado: ${error.message}` }
  }
}

/** @deprecated Usar pushFiles en su lugar. */
export const pushBicepFile = (settings, bicepContent, commitMessage) =>
  pushFiles(settings, [{ path: settings.filePath, content: bicepContent }], commitMessage)
