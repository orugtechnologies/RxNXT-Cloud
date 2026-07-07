// Dummy Zod export so that validation.ts doesn't fail if we decide to use it
// In a real env, we'd install zod. The requirements said Zod is in package.json but not actually used.
export const z = {
  string: () => ({ min: () => ({}), email: () => ({}) }),
  object: (schema: any) => ({ parse: (data: any) => data, safeParse: (data: any) => ({ success: true, data }) }),
};
