'use strict';

const { z } = require('zod');

const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').max(100),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  code: z
    .string()
    .min(2, 'Code must be at least 2 characters')
    .max(20)
    .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase alphanumeric with dashes/underscores'),
  tier: z.enum(['starter', 'professional', 'enterprise']).optional().default('starter'),
  contact_email: z.string().email('Invalid contact email').optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  max_users: z.number().int().positive().optional().default(50),
  settings: z.record(z.any()).optional().default({}),
});

const updateOrganizationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  status: z.enum(['active', 'suspended', 'inactive']).optional(),
  tier: z.enum(['starter', 'professional', 'enterprise']).optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
  max_users: z.number().int().positive().optional(),
  settings: z.record(z.any()).optional(),
});

const addMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'advisor', 'auditor', 'client']).default('client'),
});

const updateMemberRoleSchema = z.object({
  role: z.enum(['owner', 'admin', 'advisor', 'auditor', 'client']),
});

module.exports = {
  createOrganizationSchema,
  updateOrganizationSchema,
  addMemberSchema,
  updateMemberRoleSchema,
};

