import StoryCard from "./StoryCard";
import { StorySkeleton } from "../common/Skeleton";
export default function StoryGrid({blogs,loading}){ if(loading)return <div className="story-grid">{[1,2,3].map(i=><StorySkeleton key={i}/>)}</div>; return <div className="story-grid">{blogs.map((blog,i)=><StoryCard key={blog.blogId} blog={blog} featured={i===0}/>)}</div>; }
