CREATE TABLE "group" (
  "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
  "name" TEXT NOT NULL,
  "isIdentityGroup" BOOLEAN NOT NULL DEFAULT false,
  "isEmployeeTypeGroup" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMP(3),
  
  CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "membership" (
  "id" SERIAL NOT NULL,
  "groupId" TEXT NOT NULL,
  "memberGroupId" TEXT,
  "memberUserId" TEXT,

  CONSTRAINT "membership_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "membership_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "membership_memberGroupId_fkey" FOREIGN KEY ("memberGroupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "membership_memberUserId_fkey" FOREIGN KEY ("memberUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  
  CONSTRAINT uq_membership
    UNIQUE ( "groupId", "memberGroupId", "memberUserId" ),
  
  CONSTRAINT membership_hasPersonOrGroup
    CHECK (
      ("memberGroupId" IS NULL AND "memberUserId" IS NOT NULL) 
      OR 
      ("memberGroupId" IS NOT NULL AND "memberUserId" IS NULL)
    )
);

CREATE INDEX index_membership_groupId ON "membership" ("groupId");
CREATE INDEX index_membership_memberGroupId ON "membership" ("memberGroupId");
CREATE INDEX index_membership_memberUserId ON "membership" ("memberUserId");

CREATE FUNCTION public.create_employee_type_group()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."group" ("id", "name", "isEmployeeTypeGroup")
  VALUES (new.id, new.name, TRUE);

  INSERT INTO public."membership"("groupId", "memberGroupId")
  VALUES ('00000000-0000-0000-0000-000000000000', new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION public.update_employee_type_group()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public."group" SET "name" = new.name
  WHERE "id" = new.id AND "isEmployeeTypeGroup" = TRUE;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION public.create_user_identity_group()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."group" ("id", "name", "isIdentityGroup")
  VALUES (new.id, new."fullName", TRUE);

  INSERT INTO public."membership"("groupId", "memberUserId")
  VALUES (new.id, new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION public.update_user_identity_group()
RETURNS TRIGGER AS $$
BEGIN
  update public."group" set "name" = new."fullName"
  where "id" = new.id and "isIdentityGroup" = TRUE;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE FUNCTION public.add_employee_to_employee_type_group()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public."membership" ("groupId", "memberUserId")
  VALUES (new."employeeTypeId", new.id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE FUNCTION public.update_employee_to_employee_type_group()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public."membership" SET "groupId" = new."employeeTypeId"
  WHERE "groupId" = old."employeeTypeId" AND "memberUserId" = new.id;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


CREATE TRIGGER on_employee_type_created
  AFTER INSERT on public."employeeType"
  FOR EACH ROW EXECUTE PROCEDURE public.create_employee_type_group();

CREATE TRIGGER on_user_created
  AFTER INSERT on public.user
  FOR EACH ROW EXECUTE PROCEDURE public.create_user_identity_group();    

CREATE TRIGGER on_employee_created
  AFTER INSERT on public.employee
  FOR EACH ROW EXECUTE PROCEDURE public.add_employee_to_employee_type_group();

CREATE TRIGGER on_user_updated
  AFTER UPDATE on public.user
  FOR EACH ROW EXECUTE PROCEDURE public.update_user_identity_group();

CREATE TRIGGER on_employee_updated
  AFTER UPDATE on public.employee
  FOR EACH ROW EXECUTE PROCEDURE public.update_employee_to_employee_type_group();

CREATE TRIGGER on_employee_type_updated
  AFTER UPDATE on public."employeeType"
  FOR EACH ROW EXECUTE PROCEDURE public.update_employee_type_group();


CREATE VIEW "group_member" AS 
  SELECT
    gm.id,
    g.name,
    g."isIdentityGroup",
    g."isEmployeeTypeGroup",
    gm."groupId",
    gm."memberGroupId",
    gm."memberUserId",
    to_jsonb(u) as user
  FROM 
    "membership" gm 
    INNER JOIN "group" g ON g.id = gm."groupId"
    LEFT OUTER JOIN "user" u ON u.id = gm."memberUserId";

-- CREATE VIEW "group_members" AS
--   SELECT 
--     root_g."groupId", 
--     root_g."name",
--     root_g."memberGroupId",
--     COALESCE(jsonb_agg(root_users.user) FILTER (WHERE root_users.user IS NOT NULL), '[]') as users
--   FROM 
--     "group_member" root_g
--   LEFT JOIN "group_member" root_users
--     ON root_users."groupId" = root_g."memberUserId"
--   WHERE root_g."isIdentityGroup" = false
--   GROUP BY 
--     root_g."groupId",
--     root_g."name",
--     root_g."memberGroupId";

-- CREATE VIEW "groups_view_linear" AS
--   SELECT 
--     root_g."groupId", 
--     root_g.name, 
--     root_g.users, 
--     coalesce(jsonb_agg(to_jsonb(member_g)) filter (where member_g."groupId" is not null) , '[]') as children 
--   FROM 
--     "group_members" root_g
--   LEFT JOIN 
--     "group_members" member_g 
--     ON root_g."memberGroupId" = member_g."groupId"
--   GROUP BY
--     root_g."groupId", 
--     root_g.name, 
--     root_g.users;

CREATE RECURSIVE VIEW groups_recursive 
(
  "groupId", 
  "name",
  "parentId",
  "isIdentityGroup",
  "isEmployeeTypeGroup",
  "user"
) AS 
  SELECT 
    "groupId", 
    "name", 
    NULL AS "parentId", 
    "isIdentityGroup", 
    "isEmployeeTypeGroup",
    "user"
  FROM group_member
  UNION ALL 
  SELECT g2."groupId", g2.name, g1."groupId" AS "parentId", g1."isIdentityGroup", g2."isEmployeeTypeGroup",  g2."user"
  FROM group_member g1 
  INNER JOIN group_member g2 ON g1."memberGroupId" = g2."groupId";

CREATE VIEW groups_view AS
  SELECT 
    "groupId" as "id", 
    "isEmployeeTypeGroup",
    "name", 
    "parentId", 
    coalesce(jsonb_agg("user") filter (where "user" is not null), '[]') as users
  FROM groups_recursive 
  WHERE "isIdentityGroup" = false
  GROUP BY "groupId", "name", "parentId", "isEmployeeTypeGroup"
  ORDER BY "isEmployeeTypeGroup" DESC;


CREATE OR REPLACE FUNCTION groups_for_user(uid text) RETURNS "jsonb"
  LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
  AS $$
  DECLARE retval jsonb;
  BEGIN    
    WITH RECURSIVE "groupsForUser" AS (
    SELECT "groupId", "memberGroupId", "memberUserId" FROM "membership"
    WHERE "memberUserId" = uid::text
    UNION
      SELECT g1."groupId", g1."memberGroupId", g1."memberUserId" FROM "membership" g1
      INNER JOIN "groupsForUser" g2 ON g2."groupId" = g1."memberGroupId"
    ) SELECT coalesce(jsonb_agg("groupId"), '[]') INTO retval AS groups FROM "groupsForUser";
    RETURN retval;
  END;
$$;

CREATE OR REPLACE FUNCTION users_for_groups(groups text[]) RETURNS "jsonb"
  LANGUAGE "plpgsql" SECURITY DEFINER SET search_path = public
  AS $$
  DECLARE retval jsonb;
  BEGIN    
    WITH RECURSIVE "usersForGroups" AS (
    SELECT "groupId", "memberGroupId", "memberUserId" FROM "membership"
    WHERE "groupId" = ANY(groups)
    UNION
      SELECT g1."groupId", g1."memberGroupId", g1."memberUserId" FROM "membership" g1
      INNER JOIN "usersForGroups" g2 ON g2."memberGroupId" = g1."groupId"
    ) SELECT coalesce(jsonb_agg("memberUserId"), '[]') AS groups INTO retval FROM "usersForGroups" WHERE "memberUserId" IS NOT NULL;
    RETURN retval;
  END;
$$;

NOTIFY pgrst, 'reload schema';

