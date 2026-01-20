import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

function Redirect() {
  const { shortUrl } = useParams<{ shortUrl: string }>()

  useEffect(() => {
    // Lógica de redirecionamento será implementada aqui
    // Buscar o link na API e redirecionar
    console.log('Redirecionando para:', shortUrl)
  }, [shortUrl])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 dark:border-white mx-auto"></div>
        <p className="mt-4 text-gray-400 dark:text-gray-400">
          Redirecionando...
        </p>
      </div>
    </div>
  )
}

export default Redirect
