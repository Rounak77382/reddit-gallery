// app/page.js
import Header from "@/app/_components/Header";
import dotenv from "dotenv";
dotenv.config({ path: '.env' });


export default function Home() {
  return (
    <>
      <Header  />
      {process.env.praw_api_client_id}
    </>
  );
}
