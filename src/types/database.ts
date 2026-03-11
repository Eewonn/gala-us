export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          avatar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          avatar?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      galas: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          cover_image: string | null;
          organizer_id: string;
          decision_type: "organizer" | "majority" | "random";
          stage: "planning" | "confirmed" | "live" | "completed";
          invite_code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          cover_image?: string | null;
          organizer_id: string;
          decision_type?: "organizer" | "majority" | "random";
          stage?: "planning" | "confirmed" | "live" | "completed";
          invite_code?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          cover_image?: string | null;
          organizer_id?: string;
          decision_type?: "organizer" | "majority" | "random";
          stage?: "planning" | "confirmed" | "live" | "completed";
          invite_code?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      gala_members: {
        Row: {
          id: string;
          gala_id: string;
          user_id: string;
          role: "organizer" | "member";
          joined_at: string;
        };
        Insert: {
          id?: string;
          gala_id: string;
          user_id: string;
          role?: "organizer" | "member";
          joined_at?: string;
        };
        Update: {
          id?: string;
          gala_id?: string;
          user_id?: string;
          role?: "organizer" | "member";
          joined_at?: string;
        };
        Relationships: [];
      };
      suggestions: {
        Row: {
          id: string;
          gala_id: string;
          user_id: string;
          type: "location" | "food" | "date" | "activity";
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          gala_id: string;
          user_id: string;
          type: "location" | "food" | "date" | "activity";
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          gala_id?: string;
          user_id?: string;
          type?: "location" | "food" | "date" | "activity";
          content?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          suggestion_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          suggestion_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          suggestion_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          gala_id: string;
          title: string;
          assigned_to: string | null;
          status: "todo" | "doing" | "done";
          created_at: string;
        };
        Insert: {
          id?: string;
          gala_id: string;
          title: string;
          assigned_to?: string | null;
          status?: "todo" | "doing" | "done";
          created_at?: string;
        };
        Update: {
          id?: string;
          gala_id?: string;
          title?: string;
          assigned_to?: string | null;
          status?: "todo" | "doing" | "done";
          created_at?: string;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          gala_id: string;
          paid_by: string;
          amount: number;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          gala_id: string;
          paid_by: string;
          amount: number;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          gala_id?: string;
          paid_by?: string;
          amount?: number;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      memories: {
        Row: {
          id: string;
          gala_id: string;
          user_id: string;
          drive_link: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gala_id: string;
          user_id: string;
          drive_link: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gala_id?: string;
          user_id?: string;
          drive_link?: string;
          caption?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type User = Database["public"]["Tables"]["users"]["Row"];
export type Gala = Database["public"]["Tables"]["galas"]["Row"];
export type GalaMember = Database["public"]["Tables"]["gala_members"]["Row"];
export type Suggestion = Database["public"]["Tables"]["suggestions"]["Row"];
export type Vote = Database["public"]["Tables"]["votes"]["Row"];
export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type Memory = Database["public"]["Tables"]["memories"]["Row"];

export type SuggestionWithVotes = Suggestion & {
  vote_count: number;
  user_has_voted: boolean;
  author_name?: string;
};

export type TaskWithAssignee = Task & {
  assignee_name?: string;
  assignee_avatar?: string | null;
};

export type ExpenseWithPayer = Expense & {
  payer_name?: string;
};

export type GalaWithMembers = Gala & {
  members: (GalaMember & { user: User })[];
  organizer: User;
};
