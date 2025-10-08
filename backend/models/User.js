import { supabaseAdmin } from '../config/supabase.js';
import bcrypt from 'bcryptjs';

export class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.plan = data.plan || 'free';
    this.active = data.active !== false;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(userData) {
    try {
      const { email, password, name, plan = 'free' } = userData;

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 12);

      // Criar usuário no Supabase
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert([{
          email,
          password_hash: hashedPassword,
          name,
          plan,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      return new User(data);
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Usuário não encontrado
        }
        throw error;
      }

      return new User(data);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return new User(data);
    } catch (error) {
      throw error;
    }
  }

  async validatePassword(password) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('password_hash')
        .eq('id', this.id)
        .single();

      if (error) {
        throw error;
      }

      return await bcrypt.compare(password, data.password_hash);
    } catch (error) {
      throw error;
    }
  }

  async updatePlan(newPlan) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update({
          plan: newPlan,
          updated_at: new Date().toISOString()
        })
        .eq('id', this.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      this.plan = data.plan;
      this.updated_at = data.updated_at;
      return this;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(updates) {
    try {
      const allowedUpdates = ['name', 'email'];
      const filteredUpdates = {};

      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          filteredUpdates[key] = updates[key];
        }
      }

      filteredUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(filteredUpdates)
        .eq('id', this.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      Object.assign(this, data);
      return this;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      plan: this.plan,
      active: this.active,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}
