// The Mongo collection to which our schema will be attached
RoleHierarchy = new Mongo.Collection("role_hierarchy");

RoleHierarchySchema = new SimpleSchema({
  name: {
    type: String,
    index: true,
    unique: true
  },
  roles: {
    type: [String],
    optional: true
  }
});

RoleHierarchy.attachSchema(RoleHierarchySchema);
