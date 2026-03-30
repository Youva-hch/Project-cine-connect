/**
 * Utilitaire pour tester la connexion au backend
 */
export async function testBackendConnection(): Promise<{
  success: boolean
  message: string
  details?: unknown
}> {
  const apiUrl = import.meta.env.VITE_API_URL || ''
  
  try {
    // Test 1: Health check
    const healthResponse = await fetch(`${apiUrl}/health`)
    const healthData = await healthResponse.json()
    
    if (!healthResponse.ok) {
      return {
        success: false,
        message: `Backend non accessible (status: ${healthResponse.status})`,
        details: healthData,
      }
    }
    
    // Test 2: Route par défaut
    const rootResponse = await fetch(`${apiUrl}/`)
    const rootData = await rootResponse.json()
    
    return {
      success: true,
      message: 'Connexion au backend réussie !',
      details: {
        health: healthData,
        root: rootData,
        apiUrl,
      },
    }
  } catch (error) {
    return {
      success: false,
      message: `Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      details: {
        apiUrl,
        error: error instanceof Error ? error.stack : error,
      },
    }
  }
}

