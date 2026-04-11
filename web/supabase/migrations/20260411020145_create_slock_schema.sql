/*
  # Slock - Team Collaboration Platform Schema

  1. New Tables
    - `workspaces` - Team workspaces
      - `id` (uuid, primary key)
      - `name` (text) - Workspace display name
      - `slug` (text, unique) - URL-friendly identifier
      - `avatar_color` (text) - Color for workspace icon
      - `created_at` (timestamptz)
    - `profiles` - User profiles within the system
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `display_name` (text)
      - `avatar_url` (text)
      - `status_emoji` (text)
      - `status_text` (text)
      - `presence` (text) - online/away/dnd/offline
      - `created_at` (timestamptz)
    - `workspace_members` - Membership join table
      - `workspace_id` (uuid, references workspaces)
      - `user_id` (uuid, references profiles)
      - `role` (text) - owner/admin/member
      - `joined_at` (timestamptz)
    - `channels` - Channels within a workspace
      - `id` (uuid, primary key)
      - `workspace_id` (uuid, references workspaces)
      - `name` (text)
      - `description` (text)
      - `is_private` (boolean)
      - `is_dm` (boolean)
      - `created_by` (uuid, references profiles)
      - `created_at` (timestamptz)
    - `channel_members` - Channel membership
      - `channel_id` (uuid, references channels)
      - `user_id` (uuid, references profiles)
      - `last_read_at` (timestamptz)
      - `is_muted` (boolean)
      - `is_starred` (boolean)
      - `joined_at` (timestamptz)
    - `messages` - Messages in channels
      - `id` (uuid, primary key)
      - `channel_id` (uuid, references channels)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `thread_id` (uuid, self-reference for threads)
      - `is_pinned` (boolean)
      - `is_system` (boolean)
      - `attachment_url` (text)
      - `attachment_type` (text)
      - `edited_at` (timestamptz)
      - `created_at` (timestamptz)
    - `reactions` - Emoji reactions on messages
      - `id` (uuid, primary key)
      - `message_id` (uuid, references messages)
      - `user_id` (uuid, references profiles)
      - `emoji` (text)
      - `created_at` (timestamptz)
    - `saved_items` - Bookmarked/saved messages
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `message_id` (uuid, references messages)
      - `created_at` (timestamptz)

  2. Security
    - RLS enabled on all tables
    - Policies for authenticated workspace member access
*/

CREATE TABLE IF NOT EXISTS workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  avatar_color text DEFAULT '#FFD700',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  username text UNIQUE NOT NULL,
  display_name text NOT NULL DEFAULT '',
  avatar_url text DEFAULT '',
  status_emoji text DEFAULT '',
  status_text text DEFAULT '',
  presence text DEFAULT 'online',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS workspace_members (
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member',
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id uuid REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  is_private boolean DEFAULT false,
  is_dm boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS channel_members (
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at timestamptz DEFAULT now(),
  is_muted boolean DEFAULT false,
  is_starred boolean DEFAULT false,
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (channel_id, user_id)
);

ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id uuid REFERENCES channels(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  content text NOT NULL DEFAULT '',
  thread_id uuid REFERENCES messages(id),
  is_pinned boolean DEFAULT false,
  is_system boolean DEFAULT false,
  attachment_url text DEFAULT '',
  attachment_type text DEFAULT '',
  edited_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, user_id, emoji)
);

ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS saved_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, message_id)
);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_messages_channel_id ON messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_channels_workspace_id ON channels(workspace_id);
CREATE INDEX IF NOT EXISTS idx_reactions_message_id ON reactions(message_id);

CREATE POLICY "Workspace members can view workspaces"
  ON workspaces FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
  ));

CREATE POLICY "Workspace owners can update workspaces"
  ON workspaces FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role = 'owner'
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = workspaces.id
    AND workspace_members.user_id = auth.uid()
    AND workspace_members.role = 'owner'
  ));

CREATE POLICY "Authenticated users can create workspaces"
  ON workspaces FOR INSERT TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can view profiles of workspace peers"
  ON profiles FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workspace_members wm1
    JOIN workspace_members wm2 ON wm1.workspace_id = wm2.workspace_id
    WHERE wm1.user_id = auth.uid() AND wm2.user_id = profiles.id
  ));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Members can view workspace memberships"
  ON workspace_members FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM workspace_members wm
    WHERE wm.workspace_id = workspace_members.workspace_id
    AND wm.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own membership"
  ON workspace_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Channel members can view channels"
  ON channels FOR SELECT TO authenticated
  USING (
    (NOT is_private AND EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = channels.workspace_id
      AND workspace_members.user_id = auth.uid()
    ))
    OR EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = channels.id
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Workspace members can create channels"
  ON channels FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_members.workspace_id = channels.workspace_id
    AND workspace_members.user_id = auth.uid()
  ));

CREATE POLICY "Members can view channel memberships"
  ON channel_members FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM channel_members cm
    WHERE cm.channel_id = channel_members.channel_id
    AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Users can manage own channel membership"
  ON channel_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own channel membership"
  ON channel_members FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Channel members can view messages"
  ON messages FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_members.channel_id = messages.channel_id
    AND channel_members.user_id = auth.uid()
  ));

CREATE POLICY "Channel members can send messages"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM channel_members
      WHERE channel_members.channel_id = messages.channel_id
      AND channel_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Channel members can view reactions"
  ON reactions FOR SELECT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM messages m
    JOIN channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = reactions.message_id
    AND cm.user_id = auth.uid()
  ));

CREATE POLICY "Users can add reactions"
  ON reactions FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM messages m
      JOIN channel_members cm ON cm.channel_id = m.channel_id
      WHERE m.id = reactions.message_id
      AND cm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can remove own reactions"
  ON reactions FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view own saved items"
  ON saved_items FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can save items"
  ON saved_items FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can unsave items"
  ON saved_items FOR DELETE TO authenticated
  USING (user_id = auth.uid());
