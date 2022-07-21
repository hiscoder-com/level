DECLARE
  from_user_role app_role;

to_user_role app_role;

BEGIN
  SELECT
    user_roles.role
  FROM
    user_roles
  WHERE
    user_roles.user_id = can_change_role1.from_user INTO from_user_role;

SELECT
  user_roles.role
FROM
  user_roles
WHERE
  user_roles.user_id = can_change_role1.to_user INTO to_user_role;

IF can_change_role1.role = 'admin' THEN RETURN '1';

END IF;

IF can_change_role1.role = 'coordinator'
AND from_user_role = 'admin'
AND to_user_role NOT IN ('admin', 'coordinator') THEN RETURN '2';

END IF;

IF can_change_role1.role = 'moderator'
AND from_user_role = 'admin'
AND to_user_role NOT IN ('admin', 'moderator') THEN RETURN '3';

ELSEIF can_change_role1.role = 'moderator'
AND from_user_role = 'coordinator'
AND to_user_role = 'translator' THEN RETURN '4';

END IF;

IF can_change_role1.role = 'translator'
AND from_user_role = 'admin'
AND to_user_role NOT IN ('admin', 'translator') THEN RETURN '5';

ELSEIF can_change_role1.role = 'translator'
AND from_user_role = 'coordinator'
AND to_user_role = 'moderator' THEN RETURN '6';

END IF;

RETURN '7';

END;