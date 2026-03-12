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
          email: string | null;
          avatar: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          avatar?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string | null;
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
          proposed_budget_per_person: number | null;
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
          proposed_budget_per_person?: number | null;
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
          proposed_budget_per_person?: number | null;
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
          link: string | null;
          event_date: string | null;
          start_time: string | null;
          end_time: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gala_id: string;
          user_id: string;
          type: "location" | "food" | "date" | "activity";
          content: string;
          link?: string | null;
          event_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gala_id?: string;
          user_id?: string;
          type?: "location" | "food" | "date" | "activity";
          content?: string;
          link?: string | null;
          event_date?: string | null;
          start_time?: string | null;
          end_time?: string | null;
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
          status: "todo" | "doing" | "done" | "cancelled";
          created_at: string;
        };
        Insert: {
          id?: string;
          gala_id: string;
          title: string;
          assigned_to?: string | null;
          status?: "todo" | "doing" | "done" | "cancelled";
          created_at?: string;
        };
        Update: {
          id?: string;
          gala_id?: string;
          title?: string;
          assigned_to?: string | null;
          status?: "todo" | "doing" | "done" | "cancelled";
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
          category: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gala_id: string;
          paid_by: string;
          amount: number;
          description: string;
          category?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gala_id?: string;
          paid_by?: string;
          amount?: number;
          description?: string;
          category?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      expense_assignments: {
        Row: {
          id: string;
          expense_id: string;
          user_id: string;
          amount: number;
          status: "pending" | "paid";
          paid_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          expense_id: string;
          user_id: string;
          amount: number;
          status?: "pending" | "paid";
          paid_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          expense_id?: string;
          user_id?: string;
          amount?: number;
          status?: "pending" | "paid";
          paid_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      itinerary_items: {
        Row: {
          id: string;
          gala_id: string;
          title: string;
          description: string | null;
          location: string | null;
          scheduled_time: string;
          order_index: number;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gala_id: string;
          title: string;
          description?: string | null;
          location?: string | null;
          scheduled_time: string;
          order_index?: number;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          gala_id?: string;
          title?: string;
          description?: string | null;
          location?: string | null;
          scheduled_time?: string;
          order_index?: number;
          created_by?: string | null;
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
export type ExpenseAssignment = Database["public"]["Tables"]["expense_assignments"]["Row"];
export type ItineraryItem = Database["public"]["Tables"]["itinerary_items"]["Row"];
export type Memory = Database["public"]["Tables"]["memories"]["Row"];

export type SuggestionWithVotes = Suggestion & {
  vote_count: number;
  user_has_voted: boolean;
  author_name?: string;
};

export type ItineraryItemWithCreator = ItineraryItem & {
  creator_name?: string;
};

export type TaskWithAssignee = Task & {
  assignee_name?: string;
  assignee_avatar?: string | null;
};

export type ExpenseAssignmentWithUser = ExpenseAssignment & {
  user_name?: string;
  user_avatar?: string | null;
};

export type ExpenseWithDetails = Expense & {
  creator_name?: string;
  assignments: ExpenseAssignmentWithUser[];
};

// Legacy type for backward compatibility
export type ExpenseWithPayer = Expense & {
  payer_name?: string;
};

export type GalaWithMembers = Gala & {
  members: (GalaMember & { user: User })[];
  organizer: User;
};
