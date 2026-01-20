import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-600 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-600 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-gray-500 dark:text-gray-300 mb-4">
          Página não encontrada
        </h2>
        <p className="text-gray-400 dark:text-gray-400 mb-8">
          A página que você está procurando não existe ou o link encurtado não foi encontrado.
        </p>
        <Link
          to="/"
          className="inline-block bg-blue-base hover:bg-blue-dark text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Voltar para a página inicial
        </Link>
      </div>
    </div>
  )
}

export default NotFound
