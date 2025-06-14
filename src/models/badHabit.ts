import { AppDataSource } from '../../src/dbConfig/data-source';

interface BadHabit {
  id: number;
  user_id: number;
  name: string;
  description: string | null;   
  severity: number;
  created_at: Date;
  updated_at: Date;
}

interface BadHabitWithOccurrences extends BadHabit {
  occurrences: Date[];
}

interface CreateBadHabitInput {
  name: string;
  description?: string;
  severity?: number;
}

class BadHabit {
  static findAllByUserId(id: never) {
    throw new Error('Method not implemented.');
  }
  static async find(userId: number): Promise<BadHabitWithOccurrences[]> {
const connection = AppDataSource.manager;
    try {
      const [habits] = await connection.query(
        'SELECT * FROM bad_habits WHERE user_id = ?',
        [userId]
      );
      
      // Get occurrences for each habit
      const habitsWithOccurrences = await Promise.all(
        (habits as BadHabit[]).map(async (habit) => {
          const [occurrences] = await connection.query(
            'SELECT occurrence_date FROM habit_occurrences WHERE habit_id = ? ORDER BY occurrence_date DESC',
            [habit.id]
          );
          
          return {
            ...habit,
            occurrences: occurrences.map((o: any) => new Date(o.occurrence_date))
          };
        })
      );
      
      return habitsWithOccurrences;
    } finally {
      connection.release();
    }
  }

  static async create(userId: number, data: CreateBadHabitInput): Promise<BadHabit> {
const connection = AppDataSource.manager;
    try {
      const [result] = await connection.query(
        `INSERT INTO bad_habits 
         (user_id, name, description, severity, created_at, updated_at) 
         VALUES (?, ?, ?, ?, NOW(), NOW())`,
        [userId, data.name, data.description || null, data.severity || 3]
      );
      
      const [newHabit] = await connection.query(
        'SELECT * FROM bad_habits WHERE id = ?',
        [(result as any).insertId]
      );
      
      return newHabit[0];
    } finally {
      connection.release();
    }
  }

  static async update(
    userId: number, 
    habitId: number, 
    data: Partial<CreateBadHabitInput>
  ): Promise<BadHabit | null> {
const connection = AppDataSource.manager;
    try {
      // First check if habit belongs to user
      const [existing] = await connection.query(
        'SELECT * FROM bad_habits WHERE id = ? AND user_id = ?',
        [habitId, userId]
      );
      
      if (!existing.length) {
        return null;
      }
      
      // Build update query dynamically based on provided fields
      const updates: string[] = [];
      const values: any[] = [];
      
      if (data.name !== undefined) {
        updates.push('name = ?');
        values.push(data.name);
      }
      if (data.description !== undefined) {
        updates.push('description = ?');
        values.push(data.description);
      }
      if (data.severity !== undefined) {
        updates.push('severity = ?');
        values.push(data.severity);
      }
      
      if (updates.length === 0) {
        return existing[0];
      }
      
      updates.push('updated_at = NOW()');
      
      await connection.query(
        `UPDATE bad_habits SET ${updates.join(', ')} WHERE id = ?`,
        [...values, habitId]
      );
      
      const [updated] = await connection.query(
        'SELECT * FROM bad_habits WHERE id = ?',
        [habitId]
      );
      
      return updated[0];
    } finally {
      connection.release();
    }
  }

  static async delete(userId: number, habitId: number): Promise<boolean> {
const connection = AppDataSource.manager;
    try {
      // First check if habit belongs to user
      const [existing] = await connection.query(
        'SELECT id FROM bad_habits WHERE id = ? AND user_id = ?',
        [habitId, userId]
      );
      
      if (!existing.length) {
        return false;
      }
      
      // Delete occurrences first to maintain referential integrity
      await connection.query(
        'DELETE FROM habit_occurrences WHERE habit_id = ?',
        [habitId]
      );
      
      await connection.query(
        'DELETE FROM bad_habits WHERE id = ?',
        [habitId]
      );
      
      return true;
    } finally {
      connection.release();
    }
  }

  static async recordOccurrence(userId: number, habitId: number): Promise<BadHabitWithOccurrences | null> {
const connection = AppDataSource.manager;
    try {
      // First check if habit belongs to user
      const [existing] = await connection.query(
        'SELECT id FROM bad_habits WHERE id = ? AND user_id = ?',
        [habitId, userId]
      );
      
      if (!existing.length) {
        return null;
      }
      
      // Record the occurrence
      await connection.query(
        'INSERT INTO habit_occurrences (user_id, habit_id, occurrence_date) VALUES (?, ?, NOW())',
        [userId, habitId]
      );
      
      // Return the updated habit with all occurrences
      const [habit] = await connection.query(
        'SELECT * FROM bad_habits WHERE id = ?',
        [habitId]
      );
      
      const [occurrences] = await connection.query(
        'SELECT occurrence_date FROM habit_occurrences WHERE habit_id = ? ORDER BY occurrence_date DESC',
        [habitId]
      );
      
      return {
        ...habit[0],
        occurrences: occurrences.map((o: any) => new Date(o.occurrence_date))
      };
    } finally {
      connection.release();
    }
  }
}

export default BadHabit;