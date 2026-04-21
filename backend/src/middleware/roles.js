// ============================================================
// Middleware: Autorização por Role
// ============================================================

/**
 * Factory que retorna middleware para verificar se o usuário
 * possui uma das roles permitidas.
 *
 * Uso: authorize('admin', 'gerente')
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Acesso negado. Apenas ${allowedRoles.join(', ')} podem realizar esta ação.`,
      });
    }

    return next();
  };
}

module.exports = authorize;
