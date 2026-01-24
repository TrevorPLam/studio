/**
 * ============================================================================
 * KILL-SWITCH MODULE TESTS
 * ============================================================================
 *
 * @file tests/unit/lib/ops/killswitch.test.ts
 * @epic P0 Kill-switch
 *
 * Tests for centralized kill-switch functionality.
 *
 * ============================================================================
 */

import {
  getKillSwitchStatus,
  setKillSwitch,
  assertNotKilled,
  isKillSwitchEnabled,
  KillSwitchActiveError,
} from '@/lib/ops/killswitch';

describe('KillSwitch', () => {
  beforeEach(() => {
    // Reset kill-switch state before each test
    setKillSwitch(false);
  });

  describe('getKillSwitchStatus', () => {
    it('should return disabled status after reset', () => {
      setKillSwitch(false);
      const status = getKillSwitchStatus();
      expect(status.enabled).toBe(false);
      // Explanation: lastToggledAt will be set when setKillSwitch is called (even when disabling),
      // so it will not be null if the kill-switch was previously toggled in this test run.
      // This is expected behavior - the timestamp tracks the last toggle operation.
    });

    it('should return enabled status after enabling', () => {
      setKillSwitch(true, 'test-user');
      const status = getKillSwitchStatus();
      expect(status.enabled).toBe(true);
      expect(status.lastToggledAt).not.toBeNull();
      expect(status.lastToggledBy).toBe('test-user');
    });
  });

  describe('setKillSwitch', () => {
    it('should enable kill-switch', () => {
      const status = setKillSwitch(true, 'test-user');
      expect(status.enabled).toBe(true);
      expect(status.lastToggledBy).toBe('test-user');
      expect(status.lastToggledAt).toBeTruthy();
    });

    it('should disable kill-switch', () => {
      setKillSwitch(true, 'test-user');
      const status = setKillSwitch(false, 'test-user');
      expect(status.enabled).toBe(false);
    });

    it('should update timestamp on toggle', async () => {
      const status1 = setKillSwitch(true, 'test-user');
      const timestamp1 = status1.lastToggledAt;

      // Wait a bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 10));
      const status2 = setKillSwitch(false, 'test-user');
      const timestamp2 = status2.lastToggledAt;

      expect(timestamp1).not.toBe(timestamp2);
      expect(new Date(timestamp2).getTime()).toBeGreaterThan(new Date(timestamp1).getTime());
    });
  });

  describe('assertNotKilled', () => {
    it('should not throw when kill-switch is disabled', () => {
      expect(() => assertNotKilled()).not.toThrow();
    });

    it('should throw KillSwitchActiveError when kill-switch is enabled', () => {
      setKillSwitch(true);
      expect(() => assertNotKilled()).toThrow(KillSwitchActiveError);
      expect(() => assertNotKilled()).toThrow('Kill-switch is active');
    });
  });

  describe('isKillSwitchEnabled', () => {
    it('should return false when disabled', () => {
      expect(isKillSwitchEnabled()).toBe(false);
    });

    it('should return true when enabled', () => {
      setKillSwitch(true);
      expect(isKillSwitchEnabled()).toBe(true);
    });
  });
});
