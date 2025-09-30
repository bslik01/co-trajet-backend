// src/middleware/authorizeRoles.middleware.js

const authorize = (roles = []) => {
  // Si un seul rôle est passé, le convertir en tableau pour uniformiser
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // S'assurer que le middleware d'authentification a déjà attaché req.user
    if (!req.user || !req.user.role) {
      // Normalement, le middleware `auth` devrait déjà avoir intercepté cela
      return res.status(401).json({ message: 'Accès non autorisé : utilisateur non authentifié.' });
    }

    // Vérifier si le rôle de l'utilisateur correspond à l'un des rôles requis
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès non autorisé : rôle insuffisant.' });
    }

    // Pour les chauffeurs, on ajoute une vérification supplémentaire
    // Le chauffeur doit avoir le rôle 'chauffeur' ET être vérifié pour certaines actions (ex: publier trajet)
    if (req.user.role === 'chauffeur' && req.user.isChauffeurVerified === false && roles.includes('chauffeur')) {
      // Si la route requiert un 'chauffeur' et qu'il n'est pas vérifié
      return res.status(403).json({ message: "Accès non autorisé : Votre compte chauffeur n'est pas encore vérifié." });
    }

    next(); // L'utilisateur a les droits requis
  };
};

module.exports = authorize;
