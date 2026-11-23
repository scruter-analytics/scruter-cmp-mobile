const { raised, setTrackingDescription } = require('../plugin');
const plugin = require('../app.plugin.js');

const project = () => ({ name: 'a', slug: 'a', _internal: { projectRoot: '/nowhere' } });

describe('the Expo config plugin', () => {
  it('needs nothing: the platforms\' minimums only', () => {
    const c = plugin(project());
    expect(Object.keys(c.mods.ios).sort()).toEqual(['podfileProperties']);
    expect(Object.keys(c.mods.android).sort()).toEqual(['gradleProperties']);
  });

  it('sets the tracking prompt\'s text when the app asks it', () => {
    const c = plugin(project(), { trackingDescription: 'To show you ads about our bowls.' });
    expect(Object.keys(c.mods.ios).sort()).toEqual(['infoPlist', 'podfileProperties']);
    expect(setTrackingDescription({}, 'To show you ads.')).toEqual({ NSUserTrackingUsageDescription: 'To show you ads.' });
    expect(setTrackingDescription({ NSUserTrackingUsageDescription: 'Kept' }, undefined)).toEqual({ NSUserTrackingUsageDescription: 'Kept' });
  });

  it('refuses an empty tracking text', () => {
    expect(() => plugin(project(), { trackingDescription: ' ' })).toThrow('sentence');
    expect(() => plugin(project(), { trackingDescription: 42 })).toThrow('sentence');
  });
});

describe('raised', () => {
  it('raises a minimum, never lowers it', () => {
    expect(raised('13.4', '15.0', '50')).toBe('15.0');
    expect(raised('16.0', '15.0', '50')).toBeUndefined();
    expect(raised('23', '24', '50')).toBe('24');
    expect(raised('26', '24', '50')).toBeUndefined();
  });

  it('leaves a newer template\'s default alone', () => {
    expect(raised(undefined, '15.0', '51')).toBe('15.0');
    expect(raised(undefined, '15.0', '57')).toBeUndefined();
  });
});
