import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 dark:text-blue-400 mb-4">404</h1>
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Page Non Trouvée
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/"
            className="block w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Retour à l'Accueil
          </Link>
          <Link
            href="/products"
            className="block w-full px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition font-semibold"
          >
            Voir les Produits
          </Link>
        </div>

        <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Liens Utiles:</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              Accueil
            </Link>
            <Link href="/products" className="text-blue-600 dark:text-blue-400 hover:underline">
              Produits
            </Link>
            <Link href="/cart" className="text-blue-600 dark:text-blue-400 hover:underline">
              Panier
            </Link>
            <Link href="/orders" className="text-blue-600 dark:text-blue-400 hover:underline">
              Commandes
            </Link>
            <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
              Connexion
            </Link>
            <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
              Inscription
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

