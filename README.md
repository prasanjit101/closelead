# Closelead

Closelead is a Lead Management & Automation Platform - it sits between a traditional CRM and marketing automation tools. It's specifically focused on the critical first-touch period after lead capture.


### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/prasanjit101/closelead.git
    cd closelead
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    ```
3.  **Set up environment variables:**
    Create a `.env.local` file in the root directory and add your environment variables. Refer to `.env.example`

4.  **Database Migrations:**
    ```bash
    pnpm db:generate
    pnpm db:migrate
    ```
    This will apply any pending database migrations.

5.  **Run the development server:**
    ```bash
    pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.