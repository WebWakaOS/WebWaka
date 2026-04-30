/**
 * Sample Parity Tests
 * 
 * Phase B: Example parity tests for bakery, hotel, pharmacy, gym, church
 * These tests compare legacy vertical routes vs new engine routes.
 */

import { describe, beforeAll, afterAll } from 'vitest';
import { createParityTest } from './parity-framework';
import { setupParityTests, seedTestData, cleanupTestData, getAuthHeaders, TEST_CONFIG } from './test-fixtures';

const BASE_URL = TEST_CONFIG.baseUrl;
const AUTH_HEADERS = getAuthHeaders();

// Setup mocked backend if not using real one
beforeAll(async () => {
  setupParityTests();
  await seedTestData();
});

afterAll(async () => {
  await cleanupTestData();
});

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
    legacyPath: '/v1/verticals/bakery/profiles/bakery-profile-1',
    enginePath: '/bakery/profiles/bakery-profile-1',
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
    legacyPath: '/v1/verticals/hotel/profiles/hotel-profile-1',
    enginePath: '/hotel/profiles/hotel-profile-1',
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
