import MetricCard from '@/components/shared/MetricCard'
import OverviewCard from '@/components/shared/OverviewCard'
import PerformanceCard from '@/components/shared/PerformanceCard'
import React from 'react'

function Analytics() {
    return (
        <div className="flex max-[973px]:flex-col gap-6">
            <div className='w-full min-[973px]:w-[60%] min-[1250px]:w-[65%] flex flex-col gap-6 justify-between'>
                <div className='w-full'>
                    <MetricCard className="w-full" />
                </div>
                <div className="w-full">
                    <OverviewCard className="w-full max-w-full shadow-sm" />
                </div>
            </div>
            <PerformanceCard className="shadow-sm w-full min-[973px]:w-[40%] min-[1250px]:w-[35%]" />
        </div>
    )
}

export default Analytics