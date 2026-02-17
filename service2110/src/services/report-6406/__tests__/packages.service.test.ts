import { db } from '../../db/index.ts';
import { report6406Packages } from '../../db/schema/index.ts';
import { packagesService } from '../packages.service';
import { eq } from 'drizzle-orm';

describe('PackagesService', () => {
  beforeEach(async () => {
    await db.delete(report6406Packages);
  });

  describe('createPackage', () => {
    it('should create a new package with unique name', async () => {
      const input = {
        name: 'Test Package',
        createdBy: 'test-user',
      };

      const result = await packagesService.createPackage(input);

      expect(result.name).toBe(input.name);
      expect(result.createdBy).toBe(input.createdBy);
      
      // Verify in database
      const [pkg] = await db
        .select()
        .from(report6406Packages)
        .where(eq(report6406Packages.id, result.id));
      
      expect(pkg).toBeDefined();
      expect(pkg.name).toBe(input.name);
    });

    it('should throw error when creating package with duplicate name', async () => {
      const input = {
        name: 'Test Package',
        createdBy: 'test-user',
      };

      // Create first package
      await packagesService.createPackage(input);

      // Try to create second package with same name
      await expect(packagesService.createPackage(input))
        .rejects
        .toThrow('PACKET_NAME_DUPLICATE');
    });
  });

  describe('updatePackage', () => {
    let existingPackage;

    beforeEach(async () => {
      const input = {
        name: 'Original Package',
        createdBy: 'test-user',
      };
      existingPackage = await packagesService.createPackage(input);
    });

    it('should update package name when new name is unique', async () => {
      const result = await packagesService.updatePackage(existingPackage.id, {
        name: 'Updated Package',
      });

      expect(result.name).toBe('Updated Package');
      
      // Verify in database
      const [pkg] = await db
        .select()
        .from(report6406Packages)
        .where(eq(report6406Packages.id, existingPackage.id));
      
      expect(pkg.name).toBe('Updated Package');
    });

    it('should throw error when updating package name to existing name', async () => {
      // Create another package with different name
      const otherInput = {
        name: 'Another Package',
        createdBy: 'test-user',
      };
      const otherPackage = await packagesService.createPackage(otherInput);

      // Try to rename first package to second package's name
      await expect(packagesService.updatePackage(existingPackage.id, {
        name: otherPackage.name,
      }))
        .rejects
        .toThrow('PACKET_NAME_DUPLICATE');
    });

    it('should allow updating package name to the same name', async () => {
      // This should not throw as we're excluding current package from check
      const result = await packagesService.updatePackage(existingPackage.id, {
        name: existingPackage.name,
      });

      expect(result.name).toBe(existingPackage.name);
    });
  });
});
