import { ref } from 'vue'
import { supabase } from 'boot/supabase'
import { useAuth } from './useAuth'

export function useStorage() {
  const { currentUser } = useAuth()
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const error = ref(null)

  const BUCKET_NAME = 'activity-documents'
  const MAX_FILE_SIZE = 50 * 1024 * 1024

  const generateFilePath = (activityId, documentCode, filename) => {
    if (!currentUser.value) {
      throw new Error('User not authenticated')
    }
    // if( )   TODO: handle the situation when file path pas exists

    const userId = currentUser.value.id
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_')
    console.log( `[useStorage.js-generateFilePath:]`)
    return `${userId}/${activityId}/${documentCode}_${sanitizedFilename}`
  }

  const validateFileType = (file, allowedTypes) => {
    if (!allowedTypes || allowedTypes.length === 0) return true

    return allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        const category = type.split('/')[0]
        return file.type.startsWith(category + '/')
      }
      return file.type === type
    })
  }

  const validateFileSize = (file, maxSize = MAX_FILE_SIZE) => {
    return file.size <= maxSize
  }

  const uploadFile = async (file, activityId, documentCode) => {
    if (!file) throw new Error('No file provided')
    if (!currentUser.value) throw new Error('User not authenticated')

    try {
      uploading.value = true
      uploadProgress.value = 0
      error.value = null

      const filePath = generateFilePath(activityId, documentCode, file.name)

      const { data, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          upsert: true,
          onUploadProgress: (progress) => {
            uploadProgress.value = (progress.loaded / progress.total) * 100
          }
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      return {
        path: data.path,
        url: publicUrl,
        name: file.name,
        size: file.size,
        type: file.type
      }
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      uploading.value = false
      uploadProgress.value = 0
    }
  }

  const uploadMultipleFiles = async (files, activityId) => {
    const results = []

    for (const { file, documentCode } of files) {
      try {
        const result = await uploadFile(file, activityId, documentCode)
        results.push({ success: true, documentCode, ...result })
      } catch (err) {
        results.push({ success: false, documentCode, error: err.message })
      }
    }

    return results
  }

  const deleteFile = async (filePath) => {
    if (!currentUser.value) throw new Error('User not authenticated')

    try {
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([filePath])

      if (deleteError) throw deleteError

      return { success: true }
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const downloadFile = async (filePath) => {
    if (!currentUser.value) throw new Error('User not authenticated')

    try {
      const { data, error: downloadError } = await supabase.storage
        .from(BUCKET_NAME)
        .download(filePath)

      if (downloadError) throw downloadError

      return data
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const getSignedUrl = async (filePath, expiresIn = 3600) => {
    if (!currentUser.value) throw new Error('User not authenticated')

    try {
      const { data, error: urlError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(filePath, expiresIn)

      if (urlError) throw urlError

      return data.signedUrl
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const listActivityFiles = async (activityId) => {
    if (!currentUser.value) throw new Error('User not authenticated')

    try {
      const userId = currentUser.value.id
      const folderPath = `${userId}/${activityId}`

      const { data, error: listError } = await supabase.storage
        .from(BUCKET_NAME)
        .list(folderPath)

      if (listError) throw listError

      return data || []
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    uploading,
    uploadProgress,
    error,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    downloadFile,
    getSignedUrl,
    listActivityFiles,
    validateFileType,
    validateFileSize
  }
}
