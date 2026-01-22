import { useState, FormEvent, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { createLink, listLinks, exportLinks, deleteLink } from '../lib/api'
import Logo from '../assets/vectors/Logo.svg'
import { api } from '../config/api'

function Home() {
  const [originalUrl, setOriginalUrl] = useState('')
  const [shortUrl, setShortUrl] = useState('')
  const queryClient = useQueryClient()

  const { data: linksData, isLoading, isError, error } = useQuery({
    queryKey: ['links'],
    queryFn: () => listLinks(1, 100),
  })

  useEffect(() => {
    if (isError) {
      toast.error('Erro ao carregar links. Tente recarregar a página.')
    }
  }, [isError, error])

  const createLinkMutation = useMutation({
    mutationFn: createLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
      setOriginalUrl('')
      setShortUrl('')
      toast.success('Link criado com sucesso!')
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Erro ao criar link'
      
      // Tratar diferentes tipos de erro
      if (errorMessage.includes('Duplicate short URL') || errorMessage.includes('duplicada')) {
        toast.error('Este link encurtado já está em uso. Tente outro.')
      } else if (errorMessage.includes('Validation error') || errorMessage.includes('inválida')) {
        toast.error('URL inválida. Verifique e tente novamente.')
      } else if (errorMessage.includes('Internal server error') || errorMessage.includes('Erro interno')) {
        toast.error('Erro interno do servidor. Tente novamente mais tarde.')
      } else if (error.name === 'TypeError' || errorMessage.includes('Failed to fetch')) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.')
      } else {
        toast.error(errorMessage)
      }
    },
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!originalUrl.trim()) return

    // Garantir que a URL tenha protocolo
    let url = originalUrl.trim()
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`
    }

    createLinkMutation.mutate({
      url,
      shortUrl: shortUrl.trim() || undefined,
    })
  }

  const handleExport = async () => {
    try {
      const blob = await exportLinks()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'links.csv'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Links exportados com sucesso')
    } catch {
      toast.error('Erro ao exportar links. Tente novamente.')
    }
  }

  const deleteLinkMutation = useMutation({
    mutationFn: deleteLink,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links'] })
      toast.success('Link deletado com sucesso')
    },
    onError: (error: Error) => {
      const errorMessage = error.message || 'Erro ao deletar link'
      
      if (errorMessage.includes('não encontrado') || errorMessage.includes('not found') || errorMessage.includes('Link not found')) {
        toast.error('Link não encontrado')
      } else if (errorMessage.includes('Internal server error') || errorMessage.includes('Erro interno')) {
        toast.error('Erro interno do servidor. Tente novamente mais tarde.')
      } else if (error.name === 'TypeError' || errorMessage.includes('Failed to fetch')) {
        toast.error('Erro de conexão. Verifique sua internet e tente novamente.')
      } else {
        toast.error(errorMessage)
      }
    },
  })

  const handleDelete = async (shortUrl: string) => {
    if (confirm('Tem certeza que deseja deletar este link?')) {
      deleteLinkMutation.mutate(shortUrl)
    }
  }

  const handleCopy = async (shortUrl: string) => {
    const fullUrl = `${api.baseURL}/${shortUrl}`
    try {
      await navigator.clipboard.writeText(fullUrl)
      toast.success('Link copiado para a área de transferência')
    } catch {
      toast.error('Erro ao copiar link. Tente novamente.')
    }
  }

  const links = linksData?.links || []
  const hasLinks = links.length > 0

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto max-w-screen-xl px-6 lg:px-8 py-8">
        {/* Header com Logo */}
        <header className="mb-8">
          <img src={Logo} alt="brev.ly" className="h-6" />
        </header>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card Novo Link */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
            <h2 className="text-2xl font-bold text-gray-600 mb-6">Novo link</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                id="original-url"
                label="LINK ORIGINAL"
                placeholder="www.exemplo.com.br"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
              
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="short-url"
                  className="text-xs uppercase text-gray-400"
                >
                  LINK ENCURTADO
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-gray-400 text-md pointer-events-none">
                    brev.ly/
                  </span>
                  <input
                    id="short-url"
                    type="text"
                    value={shortUrl}
                    onChange={(e) => setShortUrl(e.target.value)}
                    placeholder=""
                    className="w-full pl-20 pr-4 py-2 rounded-lg border-2 border-gray-200 text-gray-600 transition-colors text-md focus:outline-none focus:border-blue-base focus:ring-blue-base focus:ring-2 focus:ring-offset-1"
                  />
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={createLinkMutation.isPending || !originalUrl.trim()}
                >
                  Salvar link
                </Button>
              </div>
            </form>
          </div>

          {/* Card Meus Links */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-600">Meus links</h2>
              <Button
                variant="secondary"
                icon="download-simple"
                iconPosition="right"
                onClick={handleExport}
                disabled={!hasLinks}
              >
                Baixar CSV
              </Button>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-400">Carregando...</p>
              </div>
            ) : !hasLinks ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-24 h-24 mb-4 flex items-center justify-center">
                  <svg
                    width="96"
                    height="96"
                    viewBox="0 0 256 256"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M240,88.23a54.43,54.43,0,0,1-16,37L189.25,160a54.27,54.27,0,0,1-38.63,16h-.05A54.63,54.63,0,0,1,96,119.84a8,8,0,0,1,16,.45A38.62,38.62,0,0,0,150.58,160h0a38.39,38.39,0,0,0,27.31-11.31l34.75-34.75a38.63,38.63,0,0,0-54.63-54.63l-11,11A8,8,0,0,1,135.7,59l11-11A54.65,54.65,0,0,1,224,48,54.86,54.86,0,0,1,240,88.23ZM109,185.66l-11,11A38.41,38.41,0,0,1,70.6,208h0a38.63,38.63,0,0,1-27.29-65.94L78,107.31A38.63,38.63,0,0,1,144,135.71a8,8,0,0,0,16,.45A54.86,54.86,0,0,0,144,96a54.65,54.65,0,0,0-77.27,0L32,130.75A54.62,54.62,0,0,0,70.56,224h0a54.28,54.28,0,0,0,38.64-16l11-11A8,8,0,0,0,109,185.66Z"
                      fill="#E4E6EC"
                    />
                  </svg>
                </div>
                <p className="text-sm uppercase text-gray-400 font-semibold text-center">
                  AINDA NÃO EXISTEM LINKS CADASTRADOS
                </p>
              </div>
            ) : (
              <div className="space-y-0">
                {links.map((link, index) => (
                  <div
                    key={link.id}
                    className={`flex items-center gap-4 p-4 ${
                      index !== links.length - 1 ? 'border-b border-gray-200' : ''
                    }`}
                  >
                    {/* Links - Esquerda */}
                    <div className="flex-1 min-w-0">
                      <a
                        href={`${api.baseURL}/${link.shortUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-blue-base truncate hover:underline block"
                      >
                        brev.ly/{link.shortUrl}
                      </a>
                      <a
                        href={link.originalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 mt-1 truncate hover:underline block"
                      >
                        {link.originalUrl}
                      </a>
                    </div>
                    
                    {/* Acessos - Meio */}
                    <div className="flex-shrink-0">
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {link.accessCount} acessos
                      </span>
                    </div>
                    
                    {/* Ações - Direita */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="secondary"
                        icon="copy"
                        ariaLabel="Copiar link"
                        onClick={() => handleCopy(link.shortUrl)}
                      />
                      <Button
                        variant="secondary"
                        icon="trash"
                        ariaLabel="Deletar link"
                        onClick={() => handleDelete(link.shortUrl)}
                        disabled={deleteLinkMutation.isPending}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
