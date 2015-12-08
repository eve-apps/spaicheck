'use strict';

// TODO: Add more logging and test thoroughly
// Also TODO: implement security and better error handling
// TODO: handle role/perm removal more intelligently, e.g. don't blindly remove a perm from users on role deletion if another applied user role has that same perm
// TODO: double check uses of $pull vs $pullAll

// Permissions should not get deleted after runtime in production, so we can disable this function then
Meteor.roles.find().observe({
  removed: function (permission) {
    console.log('Removing deleted permission from roles:', permission);
    // Remove deleted permission from roles
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
    // Remove deleted permission from users
    Meteor.users.update(
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

function checkPermissions (permissions, optional) {
  if (!_.isArray(permissions) || permissions.length === 0 || !_.every(permissions, String)) {
    // TODO: Improve this check as well as checkRoles to handle edge cases
    if (optional) {
      permissions = [];
    } else {
      // Ensure permissions is a non-empty array of Strings
      throw new Meteor.Error('perms-unspecified', 'Permissions must be specified.', permissions);
    }
  } else {
    // Ensure all requested permissions exist in the db
    let existingPermissions = _.pluck(Roles.getAllRoles().fetch(), 'name');
    console.log(permissions, existingPermissions);
    let invalidPermissions = _.difference(permissions, existingPermissions);
    if (invalidPermissions.length !== 0){
      console.log(permissions, existingPermissions);
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
    permissions = checkPermissions(permissions, true);

    // Create role
    RoleHierarchy.insert({name: name, roles: permissions});
  },
  deleteRole: function (name) {
    let roleDoc = RoleHierarchy.find({name: name}).fetch()[0];
    if (roleDoc != null) {
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
          },
          // Remove role's associated permissions from users
          $pullAll: {
            roles: roleDoc.roles
          }
        },
        {
          multi: true
        }
      );
    }
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

    // Add permissions to users with associated role
    Meteor.users.update(
      {
        sroles: role
      },
      {
        $addToSet: {
          roles: {
            $each: permissions
          }
        }
      },
      {
        multi: true
      }
    );
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

    // Remove permissions from users with associated role
    Meteor.users.update(
      {
        sroles: role
      },
      {
        $pullAll: {
          roles: permissions
        }
      },
      {
        multi: true
      }
    );
  },
  addRolesToUsers: function (roles, users) {
    roles = checkRoles(roles);

    // Fetch permissions associated with roles
    let permissions = _.flatten(_.pluck(RoleHierarchy.find({
      name: {
        $in: roles
      }
    }).fetch(), 'roles'));

    // Add roles and their associated permissions to users
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
          },
          roles: {
            $each: permissions
          }
        }
      },
      {
        multi: true
      }
    );
  },
  removeRolesFromUsers: function (roles, users) {
    roles = checkRoles(roles);

    // Fetch permissions associated with roles
    let permissions = _.flatten(_.pluck(RoleHierarchy.find({
      name: {
        $in: roles
      }
    }).fetch(), 'roles'));

    // Remove roles and their associated permissions from users
    Meteor.users.update(
      {
        _id: {
          $in: users
        }
      },
      {
        $pullAll: {
          sroles: roles,
          roles: permissions
        }
      },
      {
        multi: true
      }
    );
  }
});
