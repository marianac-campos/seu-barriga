test('I must know the main main assertions of Jest', () => {
  let year = null;

  expect(year).toBe(null);
  expect(year).toEqual(null);
  expect(year).toBeNull();

  year = 2024;

  expect(year).not.toBeNull();
  expect(year).toBeGreaterThan(2023);
  expect(year).toBeLessThan(2025);
  expect(year).toBeDefined();
});

test('I must know how to work with objects', () => {
  const plant = { name: 'Lavender', color: 'Purple', property: 'Calming' };

  expect(plant).toHaveProperty('name');
  expect(plant).toHaveProperty('color', 'Purple');
  expect(plant.property).toBe('Calming');

  const plant2 = { name: 'Lavender', color: 'Purple', property: 'Calming' };

  expect(plant).toEqual(plant2); // expect(plant).toBe(plant2) === Failed
  expect(plant2).toBe(plant2);
});
