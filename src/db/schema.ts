import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  primaryKey,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum("user_role", [
  "public",         // solo-spiller
  "student",        // elev tilknyttet mindst én klasse
  "teacher",        // lærer der kan oprette klasser
  "admin",          // systemadministrator
]);

export const gameTypeEnum = pgEnum("game_type", [
  "keyboard",       // Tastatur Helten
  "multiplication", // Gange Helten
]);

// ─── Users ───────────────────────────────────────────────────────────────────
// Bemærk: id er TEXT fordi Better Auth genererer egne streng-IDs (ikke UUID-format)

export const users = pgTable("users", {
  id:            text("id").primaryKey(),              // Better Auth styrer dette
  email:         text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  name:          text("name"),                         // visningsnavn (filtreres)
  image:         text("image"),                        // krævet af Better Auth
  role:          userRoleEnum("role").notNull().default("public"),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
  lastActiveAt:  timestamp("last_active_at"),
}, (t) => ({
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
}));

// ─── Sessions (Better Auth) ───────────────────────────────────────────────────

export const sessions = pgTable("sessions", {
  id:        text("id").primaryKey(),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token:     text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const accounts = pgTable("accounts", {
  id:                    text("id").primaryKey(),
  userId:                text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId:             text("account_id").notNull(),
  providerId:            text("provider_id").notNull(),
  accessToken:           text("access_token"),
  refreshToken:          text("refresh_token"),
  accessTokenExpiresAt:  timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope:                 text("scope"),
  idToken:               text("id_token"),
  password:              text("password"),
  createdAt:             timestamp("created_at").notNull().defaultNow(),
  updatedAt:             timestamp("updated_at").notNull().defaultNow(),
});

export const verifications = pgTable("verifications", {
  id:         text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value:      text("value").notNull(),
  expiresAt:  timestamp("expires_at").notNull(),
  createdAt:  timestamp("created_at").notNull().defaultNow(),
  updatedAt:  timestamp("updated_at").notNull().defaultNow(),
});

// ─── Groups (klasser) ────────────────────────────────────────────────────────

export const groups = pgTable("groups", {
  id:        uuid("id").primaryKey().defaultRandom(),
  name:      text("name").notNull(),
  code:      text("code").notNull().unique(),
  teacherId: text("teacher_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  archived:  boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  codeIdx:    uniqueIndex("groups_code_idx").on(t.code),
  teacherIdx: index("groups_teacher_idx").on(t.teacherId),
}));

// ─── Group Members ────────────────────────────────────────────────────────────

export const groupMembers = pgTable("group_members", {
  groupId:   uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  isPrimary: boolean("is_primary").notNull().default(false),
  joinedAt:  timestamp("joined_at").notNull().defaultNow(),
}, (t) => ({
  pk:       primaryKey({ columns: [t.groupId, t.userId] }),
  userIdx:  index("group_members_user_idx").on(t.userId),
  groupIdx: index("group_members_group_idx").on(t.groupId),
}));

// ─── Scores ───────────────────────────────────────────────────────────────────

export const scores = pgTable("scores", {
  id:             uuid("id").primaryKey().defaultRandom(),
  userId:         text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gameType:       gameTypeEnum("game_type").notNull().default("keyboard"),
  levelId:        integer("level_id").notNull(),
  score:          integer("score").notNull(),
  lettersCorrect: integer("letters_correct").notNull().default(0),
  lettersWrong:   integer("letters_wrong").notNull().default(0),
  durationMs:     integer("duration_ms").notNull(),
  completed:      boolean("completed").notNull().default(false),
  clientHash:     text("client_hash"),
  flagged:        boolean("flagged").notNull().default(false),
  playedAt:       timestamp("played_at").notNull().defaultNow(),
}, (t) => ({
  userPlayedIdx:   index("scores_user_played_idx").on(t.userId, t.playedAt),
  levelScoreIdx:   index("scores_level_score_idx").on(t.levelId, t.score),
  userPlayedAtIdx: index("scores_user_played_at_idx").on(t.userId, t.playedAt),
}));

// ─── Game Stats ───────────────────────────────────────────────────────────────
// Én række pr. (bruger, spiltype) — upsert ved hvert niveau-afslut.
// statsJson indeholder det fulde stats-objekt fra game-engine (JSON-streng).

export const gameStats = pgTable("game_stats", {
  userId:    text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  gameType:  gameTypeEnum("game_type").notNull(),
  statsJson: text("stats_json").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.userId, t.gameType] }),
}));

// ─── Contact Messages ─────────────────────────────────────────────────────────

export const contactMessages = pgTable("contact_messages", {
  id:           uuid("id").primaryKey().defaultRandom(),
  name:         text("name").notNull(),
  email:        text("email").notNull(),
  school:       text("school"),
  studentCount: text("student_count"),
  message:      text("message").notNull(),
  read:         boolean("read").notNull().default(false),
  createdAt:    timestamp("created_at").notNull().defaultNow(),
});

// ─── Audit Log ────────────────────────────────────────────────────────────────

export const auditLog = pgTable("audit_log", {
  id:        uuid("id").primaryKey().defaultRandom(),
  actorId:   text("actor_id").references(() => users.id, { onDelete: "set null" }),
  action:    text("action").notNull(),
  targetId:  text("target_id"),
  payload:   text("payload"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => ({
  actorIdx:   index("audit_log_actor_idx").on(t.actorId),
  createdIdx: index("audit_log_created_idx").on(t.createdAt),
}));

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  sessions:    many(sessions),
  accounts:    many(accounts),
  groupMembers: many(groupMembers),
  ownedGroups: many(groups),
  scores:      many(scores),
  gameStats:   many(gameStats),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  teacher: one(users, { fields: [groups.teacherId], references: [users.id] }),
  members: many(groupMembers),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
  user:  one(users,  { fields: [groupMembers.userId],  references: [users.id] }),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  user: one(users, { fields: [scores.userId], references: [users.id] }),
}));

export const gameStatsRelations = relations(gameStats, ({ one }) => ({
  user: one(users, { fields: [gameStats.userId], references: [users.id] }),
}));

// ─── Type exports ─────────────────────────────────────────────────────────────

export type User        = typeof users.$inferSelect;
export type NewUser     = typeof users.$inferInsert;
export type Group       = typeof groups.$inferSelect;
export type NewGroup    = typeof groups.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;
export type Score       = typeof scores.$inferSelect;
export type NewScore    = typeof scores.$inferInsert;
export type GameStats   = typeof gameStats.$inferSelect;
