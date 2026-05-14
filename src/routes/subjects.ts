import { and, desc, eq, getTableColumns, ilike, or,sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const router =express.Router();

router.get("/", async (req, res) => {
    try {
        const { search, department, page = 1, limit = 10 } = req.query;  

        const currentPage = Math.max(1, parseInt(String(page), 10)|| 1);
        const limitPerPage = Math.max(1, parseInt(String(limit),10)||10,100)

        const offset = (currentPage - 1) * limitPerPage; 
        
        const filterConditions: any[] = [];

        // ifsearch query is provided, add a condition to filter subjects by name or code
        if (search) {
            filterConditions.push(
                or(
                   ilike(subjects.name, `%${search}%`),
                   ilike(subjects.code, `%${search}%`)
               )
            );
        }

        //if department filter exist
        if (department) {
            const deptPattern =`%${String(department).replace(/[%_]/g,'\\$&')}%`
            filterConditions.push(ilike(departments.name, deptPattern)
            )
        }
        
        // combine All filters Using  AND if exist
        const whereClause = filterConditions.length > 0 ? and( ... filterConditions) : undefined;
        
        const countResult = await db.select({ count: sql<number>`count(*)` })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
        
        const totalCount = countResult[0]?.count ?? 0

        const subjectList = await db.select({
            ...getTableColumns(subjects),
            department:{... getTableColumns(departments)}
        }).from(subjects).leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt)).limit(limitPerPage)
            .offset(offset)
        
        res.status(200).json({
            data: subjectList,
            pagination:{
            page: currentPage,
            limit: limitPerPage,
                total: totalCount,
            totalPages:Math.ceil(totalCount / limitPerPage)
    
        }
        })
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).send("Error occurred while fetching subjects");
    }
});

export default router;
