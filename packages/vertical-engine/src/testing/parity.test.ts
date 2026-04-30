/**
 * Sample Parity Tests
 * 
 * Phase B: Example parity tests for bakery, hotel, pharmacy, gym, church
 * These tests compare legacy vertical routes vs new engine routes.
 */

import { describe } from 'vitest';
import { createParityTest } from './parity-framework';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:8001';

// Sample auth token for testing (replace with actual test token)
const AUTH_HEADERS = {
  Authorization: `Bearer ${process.env.TEST_TOKEN || 'test-token'}`,
};

describe('Parity Tests: Bakery Vertical', () => {
  createParityTest({
    vertical: 'bakery',
    endpoint: '/profiles (list)',
    method: 'GET',
    legacyPath: '/v1/verticals/bakery/profiles',
    enginePath: '/bakery/profiles',
    headers: AUTH_HEADERS,
  }, BASE_URL);

  createParityTest({
    vertical: 'bakery',
    endpoint: '/profiles/:id (get)',
    method: 'GET',
    legacyPath: '/v1/verticals/bakery/profiles/test-profile-id',
    enginePath: '/bakery/profiles/test-profile-id',
    headers: AUTH_HEADERS,
  }, BASE_URL);
});

describe('Parity Tests: Hotel Vertical', () => {
  createParityTest({
    vertical: 'hotel',
    endpoint: '/profiles (list)',
    method: 'GET',
    legacyPath: '/v1/verticals/hotel/profiles',
    enginePath: '/hotel/profiles',
    headers: AUTH_HEADERS,
  }, BASE_URL);

  createParityTest({
    vertical: 'hotel',
    endpoint: '/profiles/:id (get)',
    method: 'GET',
    legacyPath: '/v1/verticals/hotel/profiles/test-profile-id',
    enginePath: '/hotel/profiles/test-profile-id',
    headers: AUTH_HEADERS,
  }, BASE_URL);
});

describe('Parity Tests: Pharmacy Vertical', () => {
  createParityTest({
    vertical: 'pharmacy',
    endpoint: '/profiles (list)',
    method: 'GET',
    legacyPath: '/v1/verticals/pharmacy/profiles',
    enginePath: '/pharmacy/profiles',
    headers: AUTH_HEADERS,
  }, BASE_URL);
});

describe('Parity Tests: Gym Vertical', () => {
  createParityTest({
    vertical: 'gym',
    endpoint: '/profiles (list)',
    method: 'GET',
    legacyPath: '/v1/verticals/gym/profiles',
    enginePath: '/gym/profiles',
    headers: AUTH_HEADERS,
  }, BASE_URL);
});

describe('Parity Tests: Church Vertical', () => {
  createParityTest({
    vertical: 'church',
    endpoint: '/profiles (list)',
    method: 'GET',
    legacyPath: '/v1/verticals/church/profiles',
    enginePath: '/church/profiles',
    headers: AUTH_HEADERS,
  }, BASE_URL);
});
