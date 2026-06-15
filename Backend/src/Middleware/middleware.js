import jwt from 'jsonwebtoken';

export const Valid_User = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  // Extract token from "Bearer <token>"
  const token = authHeader && authHeader.split(' ')[1];

  // If token not present
  if (!token) {
    return res.status(401).send("JWT must be provided");
  }


  // Verify token
  jwt.verify(token, process.env.SECRET, (err, decodedUser) => {
    if (err) {
      console.error("JWT verification error:", err.message);
      return res.status(401).send("Invalid or expired token");
    }

    req.user = decodedUser;

    next();
  });
};

export const verifyOrganizationAccess = () => {
  return (req, res, next) => {
    const user = req.user;
    
    const requestedOrgId = req.params.orgId || req.body.orgId;

    // Agar requested ID user ki organizationId se match nahi karti
    if (!requestedOrgId || requestedOrgId !== user.organizationId) {
      return res.status(403).json({ message: 'Access Denied: Not your organization' });
    }
    
    next();
  };
};

