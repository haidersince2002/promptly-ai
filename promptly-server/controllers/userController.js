import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";

export const getUserPlan = async (req, res) => {
  try {
    const { userId } = req.auth();
    const user = await clerkClient.users.getUser(userId);
    const isPremium = user.privateMetadata?.premium === true;
    res.json({ success: true, plan: isPremium ? "premium" : "free" });
  } catch (error) {
    res.json({ success: false, plan: "free", message: error.message });
  }
};

export const getUserCreations = async (req, res) => {
  try {
    const { userId } = req.auth();

    const creations =
      await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;

    res.json({ success: true, creations });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const getPublishedCreations = async (req, res) => {
    try {  
      const creations =
        await sql`SELECT * FROM creations WHERE publish= true ORDER BY created_at DESC`;
  
      res.json({ success: true, creations });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  };
  

  export const toggleLikeCreation = async (req, res) => {
    try {  
        const { userId } = req.auth();
        const {id} = req.body

        const [creation] = await sql ` SELECT * FROM creations WHERE id = ${id}`

        if(!creation){
            return res.json({ success: false, message: "Creation not found"})
        }

        const currentLikes = creation.likes
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;
        
        if(currentLikes.includes(userIdStr)){
            updatedLikes = currentLikes.filter((user)=> user !== userIdStr);
            message = 'Creation Uliked'
        } else{
            updatedLikes = [...currentLikes, userIdStr]
            message = 'Creation Liked'
        }

        const formattedArray = `{${updatedLikes.join(',')}}`

        await sql `UPDATE creations SET likes = ${formattedArray}::text[] WHERE id = ${id}`
      res.json({ success: true, message });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  };


  // ─── Get all versions of a creation ─────────────────────────────────

  export const getCreationVersions = async (req, res) => {
    try {
      const { userId } = req.auth();
      const { id } = req.params;

      // Get the creation to find the root
      const [creation] = await sql`SELECT * FROM creations WHERE id = ${id} AND user_id = ${userId}`;
      if (!creation) {
        return res.json({ success: false, message: "Creation not found" });
      }

      const rootId = creation.parent_id || creation.id;

      // Get all versions (original + children)
      const versions = await sql`
        SELECT * FROM creations 
        WHERE (id = ${rootId} OR parent_id = ${rootId}) AND user_id = ${userId}
        ORDER BY version ASC
      `;

      res.json({ success: true, versions });
    } catch (error) {
      res.json({ success: false, message: error.message });
    }
  };