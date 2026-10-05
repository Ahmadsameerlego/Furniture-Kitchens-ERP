import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  RefreshCw, 
  ArrowRight, 
  ChevronLeft,
  Truck,
  Wrench,
  Hammer,
  Boxes,
  Sparkles
} from 'lucide-react';
import { ProjectPlanningReadiness } from '../../types/planning';
import { getReadinessBadge, calculateBackwardDate } from '../../services/planningService';

interface PlanningScheduleGanttViewProps {
  projects: ProjectPlanningReadiness[];
  onOpenRescheduleModal: (project: ProjectPlanningReadiness) => void;
}

export const PlanningScheduleGanttView: React.FC<PlanningScheduleGanttViewProps> = ({
  projects,
  onOpenRescheduleModal,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-indigo-600" />
            جدولة المشاريع والجدول الزمني العكسي (Project Scheduling & Gantt)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            احتساب المواعيد العكسية للمشاريع (Backward Scheduling) من تاريخ التسليم التعاقدي وصولاً إلى موعد جاهزية الخامات وبدء القص
          </p>
        </div>
      </div>

      {/* Projects Timeline Cards */}
      <div className="space-y-6">
        {projects.map((project) => {
          const badge = getReadinessBadge(project.overallReadiness);
          const earliestMaterialDate = calculateBackwardDate(project.plannedManufacturingStartDate, 3);

          return (
            <div 
              key={project.projectId}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-6"
            >
              {/* Project Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-base font-bold text-slate-900">{project.projectNumber}</span>
                    <span className="text-base font-semibold text-slate-700">- {project.projectName}</span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    العميل: <strong className="text-slate-700">{project.customerName}</strong> • نسبة جاهزية الخامات: <strong className="text-indigo-600">{project.readinessPercentage}%</strong>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left text-xs">
                    <span className="text-slate-400 block">الموعد المستهدف للتسليم</span>
                    <span className="font-bold text-emerald-700 text-sm">
                      {project.targetDeliveryDate}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenRescheduleModal(project)}
                    className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>إعادة جدولة</span>
                  </button>
                </div>
              </div>

              {/* Backward Scheduling Stages Track */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600">
                  <span>مسار الجدولة العكسية ومحطات الإنجاز (Backward Milestones Timeline)</span>
                  <span className="text-[11px] text-indigo-600 font-normal">من توفير الخامات إلى التركيب بالموقع</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  
                  {/* Step 1: Material Availability */}
                  <div className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                    project.readinessPercentage >= 100 
                      ? 'bg-emerald-50/50 border-emerald-200' 
                      : 'bg-rose-50/50 border-rose-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Boxes className="w-4 h-4 text-indigo-600" />
                        1. جاهزية الخامات
                      </span>
                      {project.readinessPercentage >= 100 ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                      )}
                    </div>
                    <span className="text-slate-500 block text-[11px]">حد أقصى للوصول:</span>
                    <span className="font-bold text-slate-900 block">{earliestMaterialDate}</span>
                    <span className={`text-[10px] font-semibold block ${project.readinessPercentage >= 100 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {project.readinessPercentage}% متوفر
                    </span>
                  </div>

                  {/* Step 2: Machining & Cutting */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Hammer className="w-4 h-4 text-blue-600" />
                        2. القص والـ CNC
                      </span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-slate-500 block text-[11px]">بدء التشغيل:</span>
                    <span className="font-bold text-slate-900 block">{project.plannedManufacturingStartDate}</span>
                    <span className="text-[10px] text-slate-500 block">منشار + تخريم + قشاط</span>
                  </div>

                  {/* Step 3: Assembly */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-amber-600" />
                        3. التجميع والشاسيه
                      </span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-slate-500 block text-[11px]">تجميع الهياكل:</span>
                    <span className="font-bold text-slate-900 block">خلال 7 أيام من القص</span>
                    <span className="text-[10px] text-slate-500 block">تجميع العلب والميكانيزم</span>
                  </div>

                  {/* Step 4: Finishing & QC */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600" />
                        4. الدهانات والفحص
                      </span>
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                    <span className="text-slate-500 block text-[11px]">انتهاء التصنيع:</span>
                    <span className="font-bold text-slate-900 block">{project.plannedManufacturingEndDate}</span>
                    <span className="text-[10px] text-slate-500 block">فحص الجودة والتغليف</span>
                  </div>

                  {/* Step 5: Site Installation */}
                  <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-blue-900 flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-blue-600" />
                        5. التوريد والتركيب
                      </span>
                      <Wrench className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <span className="text-blue-700 block text-[11px]">تاريخ التسليم للعميل:</span>
                    <span className="font-bold text-blue-950 block">{project.targetDeliveryDate}</span>
                    <span className="text-[10px] text-blue-700 block">شحن وتركيب بموقع العميل</span>
                  </div>

                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
