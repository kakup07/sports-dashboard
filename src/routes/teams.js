import { Router } from 'express';
import {
  createTeam,
  deleteTeam,
  getAllTeams,
  getTeamById,
  updateTeam,
} from '../models/teams.js';

const router = Router();

function parseTeamId(value) {
  const id = Number.parseInt(value, 10);
  return Number.isInteger(id) && id > 0 ? id : null;
}

router.post('/', async (req, res, next) => {
  try {
    const { name, city } = req.body;

    if (!name || !city) {
      return res.status(400).json({ error: 'name and city are required' });
    }

    const team = await createTeam(name, city);
    res.status(201).json(team);
  } catch (error) {
    next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const teams = await getAllTeams();
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const id = parseTeamId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'Invalid team id' });
    }

    const team = await getTeamById(id);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = parseTeamId(req.params.id);
    const { name, city } = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Invalid team id' });
    }

    if (!name || !city) {
      return res.status(400).json({ error: 'name and city are required' });
    }

    const team = await updateTeam(id, name, city);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseTeamId(req.params.id);

    if (!id) {
      return res.status(400).json({ error: 'Invalid team id' });
    }

    const deleted = await deleteTeam(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
