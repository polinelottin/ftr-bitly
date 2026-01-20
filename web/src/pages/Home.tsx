function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-600">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-600 dark:text-white mb-8">
          Encurtador de URLs
        </h1>
        
        {/* Formulário de cadastro */}
        <div className="bg-white dark:bg-gray-600 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-600 dark:text-white mb-4">
            Criar novo link
          </h2>
          {/* Formulário será implementado aqui */}
        </div>

        {/* Listagem de links */}
        <div className="bg-white dark:bg-gray-600 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-600 dark:text-white mb-4">
            Links cadastrados
          </h2>
          {/* Lista será implementada aqui */}
        </div>
      </div>
    </div>
  )
}

export default Home
