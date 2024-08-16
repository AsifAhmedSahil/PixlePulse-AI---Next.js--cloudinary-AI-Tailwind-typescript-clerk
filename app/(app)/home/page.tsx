'use client'
import React,{useState,useEffect,useCallback} from 'react'
import axios from 'axios'
import VideoCard from '@/components/VideoCard'
import { Video } from '@/types'


const Home = () => {
  const [videos,setVideos] =useState<Video[]>([])
  const [loading,setLoading] =useState(true)
  const [error,setError] =useState<string | null>(null)

  const fetchVideos = useCallback(async() =>{
    try {
      const response =await axios.get("/api/videos")
      if(Array.isArray(response.data)){
        setVideos(response.data)
      } else{
        throw new Error("unexpected response format")
      }
    } catch (error) {
      console.log(error)
      setError("Failed To fetch videos")
    } finally {
      setLoading(false)
    }
  },[])


  useEffect(()=> {
      fetchVideos()
  },[fetchVideos])


  return (
    <VideoCard/>
  )
}

export default Home