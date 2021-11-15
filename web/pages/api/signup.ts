export function updateProfile(req, res) {
  const { username, password } = req.body;
    if (!username || !password) {
        res.status(400).send({ error: 'You must provide a username and password' });
    }
    
}