"""
Job Matching Engine for ByteResume
NoSQL Database Architecture Project
Compares resume skill profile against job description requirements,
computes match percentage, lists matched and missing skills,
and provides tailored recommendations.
"""

from resume_parser import extract_skills


def match_resume_to_job(resume_data, job_data):
    """
    Computes match percentage between resume skills and job description skills.
    
    Formula:
    matchPercentage = (matched required skills / total required skills) * 100
    With preferred skills providing a modest weighted bonus (capped at 100%).
    """
    # 1. Gather resume skills
    resume_skills = set(s.lower() for s in resume_data.get("skills", []))
    if not resume_skills and "rawText" in resume_data:
        tech, soft = extract_skills(resume_data["rawText"])
        resume_skills = set(s.lower() for s in (tech + soft))

    # 2. Gather job skills
    required_skills = job_data.get("requiredSkills", [])
    preferred_skills = job_data.get("preferredSkills", [])
    job_desc_text = job_data.get("description", "")

    # If job description did not provide structured required skills, extract dynamically
    if not required_skills and job_desc_text:
        tech, soft = extract_skills(job_desc_text)
        required_skills = tech[:8] + soft[:2]

    matched_required = []
    missing_required = []

    for skill in required_skills:
        skill_clean = skill.strip()
        skill_lower = skill_clean.lower()
        # Direct match or substring containment
        if any(skill_lower == rs or skill_lower in rs or rs in skill_lower for rs in resume_skills):
            matched_required.append(skill_clean)
        else:
            missing_required.append(skill_clean)

    matched_preferred = []
    for skill in preferred_skills:
        skill_clean = skill.strip()
        skill_lower = skill_clean.lower()
        if any(skill_lower == rs or skill_lower in rs or rs in skill_lower for rs in resume_skills):
            matched_preferred.append(skill_clean)

    total_req = max(1, len(required_skills))
    matched_req_count = len(matched_required)

    base_match = (matched_req_count / total_req) * 100

    # Preferred skills bonus (up to 10 points)
    pref_bonus = 0
    if preferred_skills:
        pref_bonus = (len(matched_preferred) / len(preferred_skills)) * 10

    final_match_pct = round(min(100.0, base_match * 0.9 + pref_bonus))
    if base_match == 100:
        final_match_pct = 100

    # Generate targeted recommendations
    recommendations = []
    if missing_required:
        top_missing = missing_required[:4]
        recommendations.append(f"Prioritize learning essential requirements: {', '.join(top_missing)}.")
        recommendations.append(f"Incorporate project demonstrations featuring {top_missing[0]} on your resume.")
    else:
        recommendations.append("Outstanding match! Your skills align with all mandatory qualifications.")

    if preferred_skills and len(matched_preferred) < len(preferred_skills):
        unmatched_pref = [p for p in preferred_skills if p not in matched_preferred][:3]
        if unmatched_pref:
            recommendations.append(f"To stand out further, consider adding preferred skills: {', '.join(unmatched_pref)}.")

    recommendations.append("Tailor your resume project bullet points using exact keywords from the job posting.")

    return {
        "matchPercentage": final_match_pct,
        "matchedSkills": matched_required + matched_preferred,
        "missingSkills": missing_required,
        "recommendations": recommendations[:4],
        "totalRequired": total_req,
        "matchedCount": matched_req_count
    }
