-- Allow departments with the same name across different degrees but within the same college.
ALTER TABLE public.departments
    DROP CONSTRAINT IF EXISTS uniq_department_per_college;

ALTER TABLE public.departments
    ADD CONSTRAINT uniq_department_per_college_degree UNIQUE (college_id, degree_id, name);
