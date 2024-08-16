'use client'
import React from 'react'
import { useState,useEffect,useCallback } from 'react'
import {getCldImageUrl,getCldVideoUrl} from "next-cloudinary"
import { Download,Clock,FileDown,FileUp } from 'lucide-react'
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import {filesize} from "filesize"
import { Video } from '@prisma/client'

dayjs.extend(relativeTime)

interface VideoCardProps {
  video:Video,
  onDownload: (url:string,title:string) => void
}



const VideoCard : React.FC<VideoCardProps>= ({video,onDownload}) => {
  const [isHovered,setIsHovered] = useState(false)
  const [previewError,setPreviewError] = useState(false)

  const getThumbnailUrl = useCallback((publicId:string)=>{
    return getCldImageUrl({
      src: publicId,
      width:400,
      height:250,
      crop:"fill",
      gravity:"auto",
      format:"jpg",
      quality:"auto",
      assetType:"video"
    })
  },[])

  const getFullVideoUrl = useCallback((publicId:string)=>{
    return getCldVideoUrl({
      src: publicId,
      width:1920,
      height:1080,
      
    })
  },[])

  const getPreviewVideoUrl = useCallback((publicId:string)=>{
    return getCldVideoUrl({
      src: publicId,
      width:400,
      height:225,
      rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"]
      
    })
  },[])

  const formatSize = useCallback((size:number)=>{
    return filesize(size)
  },[])

  const formatDuration = useCallback((second:number)=>{
    const minutes = Math.floor(second / 60);
    const remainingSeconds = Math.round(second % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2,"0")}`;
  },[])

  




  return (
    <div className='max-w-sm card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300'>
      <div className="card-body p-4">
            <h2 className="card-title text-lg font-bold">{}</h2>
            <p className="text-sm text-base-content opacity-70 mb-4">
              {}
            </p>
            <p className="text-sm text-base-content opacity-70 mb-4">
              Uploaded {dayjs().fromNow()}
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <FileUp size={18} className="mr-2 text-primary" />
                <div>
                  <div className="font-semibold">Original</div>
                  <div>{formatSize(Number())}</div>
                </div>
              </div>
              <div className="flex items-center">
                <FileDown size={18} className="mr-2 text-secondary" />
                <div>
                  <div className="font-semibold">Compressed</div>
                  <div>{formatSize(Number())}</div>
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm font-semibold">
                Compression:{" "}
                <span className="text-accent">{}%</span>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() =>
                  onDownload(getFullVideoUrl(video.publicId), video.title)
                }
              >
                <Download size={16} />
              </button>
            </div>
          </div>
    </div>
  )
}

export default VideoCard