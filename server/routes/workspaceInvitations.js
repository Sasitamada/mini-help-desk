const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// Generate invitation token
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Send invitation to workspace (email-based)
router.post('/invite', async (req, res) => {
  try {
    const { workspaceId, email, role = 'member', invitedBy } = req.body;
    
    // Check if user exists
    const userResult = await req.app.locals.pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    // Check if already a member
    if (userResult.rows.length > 0) {
      const memberCheck = await req.app.locals.pool.query(
        'SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
        [workspaceId, userResult.rows[0].id]
      );
      if (memberCheck.rows.length > 0) {
        return res.status(400).json({ message: 'User is already a member of this workspace' });
      }
    }
    
    // Check if invitation already exists
    const existingInvite = await req.app.locals.pool.query(
      'SELECT id FROM workspace_invitations WHERE workspace_id = $1 AND email = $2 AND status = $3',
      [workspaceId, email, 'pending']
    );
    if (existingInvite.rows.length > 0) {
      return res.status(400).json({ message: 'Invitation already sent to this email' });
    }
    
    const token = generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry
    
    const result = await req.app.locals.pool.query(
      `INSERT INTO workspace_invitations (workspace_id, email, invited_by, role, token, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [workspaceId, email, invitedBy, role, token, expiresAt]
    );
    
    // In production, send email here with invitation link
    // For now, return the token so frontend can handle it
    res.status(201).json({
      message: 'Invitation sent successfully',
      invitation: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        role: result.rows[0].role,
        token: result.rows[0].token,
        expiresAt: result.rows[0].expires_at
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Accept invitation
router.post('/accept/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { userId } = req.body;
    
    const inviteResult = await req.app.locals.pool.query(
      'SELECT * FROM workspace_invitations WHERE token = $1 AND status = $2',
      [token, 'pending']
    );
    
    if (inviteResult.rows.length === 0) {
      return res.status(404).json({ message: 'Invitation not found or already accepted' });
    }
    
    const invitation = inviteResult.rows[0];
    
    // Check expiry
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(400).json({ message: 'Invitation has expired' });
    }
    
    // Check if user exists with this email
    const userResult = await req.app.locals.pool.query(
      'SELECT id FROM users WHERE email = $1',
      [invitation.email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: 'User with this email does not exist. Please register first.' });
    }
    
    const actualUserId = userId || userResult.rows[0].id;
    
    // Check if already a member
    const memberCheck = await req.app.locals.pool.query(
      'SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2',
      [invitation.workspace_id, actualUserId]
    );
    
    if (memberCheck.rows.length > 0) {
      // Update invitation status anyway
      await req.app.locals.pool.query(
        'UPDATE workspace_invitations SET status = $1 WHERE id = $2',
        ['accepted', invitation.id]
      );
      return res.json({ message: 'User is already a member', alreadyMember: true });
    }
    
    // Add user to workspace
    await req.app.locals.pool.query(
      'INSERT INTO workspace_members (workspace_id, user_id, role) VALUES ($1, $2, $3)',
      [invitation.workspace_id, actualUserId, invitation.role]
    );
    
    // Update invitation status
    await req.app.locals.pool.query(
      'UPDATE workspace_invitations SET status = $1 WHERE id = $2',
      ['accepted', invitation.id]
    );
    
    res.json({ message: 'Invitation accepted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get workspace invitations
router.get('/workspace/:workspaceId', async (req, res) => {
  try {
    const { rows } = await req.app.locals.pool.query(
      `SELECT i.*, u.username as invited_by_name 
       FROM workspace_invitations i
       LEFT JOIN users u ON i.invited_by = u.id
       WHERE i.workspace_id = $1
       ORDER BY i.created_at DESC`,
      [req.params.workspaceId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Cancel/Delete invitation
router.delete('/:id', async (req, res) => {
  try {
    await req.app.locals.pool.query(
      'DELETE FROM workspace_invitations WHERE id = $1',
      [req.params.id]
    );
    res.json({ message: 'Invitation cancelled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

