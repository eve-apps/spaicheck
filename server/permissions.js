'use strict';

// TODO: Add more logging and test thoroughly

// Permissions should not get deleted after runtime in production, so we can disable this function then
Meteor.roles.find().observe({
  removed: function (permission) {
    console.log('Removing deleted permission from roles:', permission);
    RoleHierarchy.update(
      {
        roles: permission.name
      },
      {
        $pull: {
          roles: permission.name
        }
      },
      {
        multi: true
      }
    );
  }
});

function checkPermissions (permissions) {
  if (!_.isArray(permissions) || permissions.length === 0 || !_.every(permissions, String)) {
    // Ensure permissions is a non-empty array of Strings
    throw new Meteor.Error('perms-unspecified', 'Permissions must be specified.', permissions);
  } else {
    // Ensure all requested permissions exist in the db
    let existingPermissions = Roles.getAllRoles().fetch();
    let invalidPermissions = _.difference(permissions, existingPermissions);
    if (invalidPermissions.length !== 0){
      throw new Meteor.Error('perms-invalid', 'One or more of the specified permissions do not exist.', invalidPermissions);
    }
  }
  // Return permissions if everything is ok
  return permissions;
}

function checkRoles (roles) {
  if (!_.isArray(roles) || roles.length === 0 || !_.every(roles, String)) {
    // Ensure roles is a non-empty array of Strings
    throw new Meteor.Error('roles-unspecified', 'Roles must be specified.', roles);
  } else {
    // Ensure all requested roles exist in the db
    let existingRoles = _.pluck(RoleHierarchy.find({}).fetch(), 'name');
    let invalidRoles = _.difference(roles, existingRoles);
    if (invalidRoles.length !== 0){
      throw new Meteor.Error('roles-invalid', 'One or more of the specified roles do not exist.', invalidRoles);
    }
  }
  // Return roles if everything is ok
  return roles;
}

Meteor.methods({
  createRole: function (name, permissions) {
    permissions = checkPermissions(permissions);
    // Create role
    RoleHierarchy.insert({name: name, roles: permissions});
  },
  deleteRole: function (name) {
    // Delete role
    RoleHierarchy.remove({name: name});
    // Remove role from users
    Meteor.users.update(
      {
        sroles: name
      },
      {
        $pull: {
          sroles: name
        }
      },
      {
        multi: true
      }
    );
    // TODO: Remove role's associated permissions from users
  },
  addPermissionsToRole: function (permissions, role) {
    permissions = checkPermissions(permissions);
    // Add permissions to role
    RoleHierarchy.update(
      {
        name: role
      },
      {
        $addToSet: {
          roles: {
            $each: permissions
          }
        }
      }
    );
    // TODO: Add permissions to users with associated role
  },
  removePermissionsFromRole: function (permissions, role) {
    permissions = checkPermissions(permissions);
    // Remove permissions from role
    RoleHierarchy.update(
      {
        name: role
      },
      {
        $pullAll: {
          roles: permissions
        }
      }
    );
    // TODO: Remove permissions from users with associated role
  },
  addRolesToUsers: function (roles, users) {
    roles = checkRoles(roles);
    // Add roles to users
    Meteor.users.update(
      {
        _id: {
          $in: users
        }
      },
      {
        $addToSet: {
          sroles: {
            $each: roles
          }
        }
      },
      {
        multi: true
      }
    );
    // TODO: Add roles' associated permissions to users
  },
  removeRolesFromUsers: function (roles, users) {
    roles = checkRoles(roles);
    // Remove roles from users
    Meteor.users.update(
      {
        _id: {
          $in: users
        }
      },
      {
        $pullAll: {
          sroles: roles
        }
      },
      {
        multi: true
      }
    );
    // TODO: Remove roles' associated permissions from users
  }
});