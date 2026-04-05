import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { getLinkByShortUrl, incrementAccess } from '../lib/api'
import NotFound from '../assets/vectors/404.svg'
import LogoIcon from '../assets/vectors/Logo_Icon.svg'

function Redirect() {
  const { shortUrl } = useParams<{ shortUrl: string }>()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'not-found' | 'redirecting'>('loading')

  useEffect(() => {
    if (!shortUrl) {
      setStatus('not-found')
      return
    }

    async function redirect() {
      try {
        const link = await getLinkByShortUrl(shortUrl as string)
        void incrementAccess(shortUrl as string).catch(() => {
          // Melhor esforço: falha de rede não deve impedir o redirect
        })
        setStatus('redirecting')
        window.location.href = link.originalUrl
      } catch (error: unknown) {
        // Verificar se é erro 404 ou outro tipo de erro
        const errorMessage = error instanceof Error ? error.message : ''
        const errorName = error instanceof Error ? error.name : ''
        const isNotFound = errorMessage.includes('Link not found') || 
                          errorMessage.includes('not found') || 
                          errorMessage.includes('não encontrado')
        
        if (!isNotFound) {
          // Mostrar toast para erros não-404 (500, rede, etc)
          if (errorName === 'TypeError' || errorMessage.includes('Failed to fetch')) {
            toast.error('Erro de conexão. Verifique sua internet e tente novamente.')
          } else if (errorMessage.includes('Internal server error')) {
            toast.error('Erro interno do servidor. Tente novamente mais tarde.')
          } else {
            toast.error('Erro ao acessar link. Tente novamente.')
          }
        }
        
        setStatus('not-found')
      }
    }

    redirect()
  }, [shortUrl])

  if (status === 'not-found') {
    return (
      <div  className="min-h-screen bg-gray-100 flex items-center justify-center relative">
        <div className="bg-white rounded-lg p-12 max-w-lg mx-4 text-center shadow-md">
          <img src={NotFound} alt="404" className="w-1/2 h-1/2 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-600 mb-6">
            Link não encontrado
          </h2>
          <p className="text-base text-gray-500 leading-relaxed">
            O link que você está tentando acessar não existe, foi removido ou é uma URL inválida. Saiba mais em{' '}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                navigate('/')
              }}
              className="text-blue-base underline hover:text-blue-dark"
            >
              brev.ly
            </a>
            .
          </p>
        </div>
      </div>
    )
  }

  return (
    <div  className="min-h-screen bg-gray-100 flex items-center justify-center relative">
        <div className="bg-white rounded-lg p-12 max-w-xl mx-4 text-center shadow-md">
          <img src={LogoIcon} alt="Logo" className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-600 mb-6">
            Redirecionando...
          </h2>
          <p className="text-base text-gray-500 leading-relaxed">
           O link será aberto automaticamente em alguns instantes. 
          </p>
          <p className="text-base text-gray-500 leading-relaxed">
           Não foi redirecionado?{' '}
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault()
                navigate(`/${shortUrl}`)
              }}
              className="text-blue-base underline hover:text-blue-dark"
            >
              Acesse aqui
            </a>
          </p>
        </div>
      </div>
  )
}

export default Redirect
