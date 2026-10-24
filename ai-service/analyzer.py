"""
Resume Analysis Engine for ByteResume
BCSE406L - NoSQL Database Project
Calculates deterministic ATS score (0-100) using a transparent 4-pillar model:
1. Technical Skills Breadth (40 pts)
2. Section Completeness (25 pts)
3. Soft Skills & Communication (15 pts)
4. Experience, Metrics & Action Verbs (20 pts)
"""

import re

# High-demand industry skills that modern ATS systems search for
CORE_BENCHMARK_SKILLS = [
    "Git", "Docker", "SQL", "Python", "JavaScript", "React", "Node.js",
    "MongoDB", "Redis", "AWS", "REST API", "Data Structures", "Algorithms",
    "Problem Solving", "Communication", "Teamwork", "Agile"
]

ACTION_VERBS = [
    "developed", "built", "implemented", "designed", "engineered", "created",
    "optimized", "deployed", "spearheaded", "managed", "collaborated",
    "architected", "automated", "improved", "delivered", "maintained"
]


def analyze_resume(parsed_data):
    """
    Analyzes parsed resume data, computes transparent 0-100 ATS score,
    identifies strengths, weaknesses, missing benchmark skills, and recommendations.
    """
    raw_text = parsed_data.get("rawText", "")
    text_lower = raw_text.lower()
    tech_skills = parsed_data.get("technicalSkills", [])
    soft_skills = parsed_data.get("softSkills", [])
    education = parsed_data.get("education", [])
    experience = parsed_data.get("experience", [])
    projects = parsed_data.get("projects", [])

    strengths = []
    weaknesses = []
    recommendations = []

    # -------------------------------------------------------------
    # Pillar 1: Technical Skills Breadth (Max 40 points)
    # -------------------------------------------------------------
    tech_count = len(tech_skills)
    if tech_count >= 10:
        pillar1_score = 40
        strengths.append(f"Strong technical skill variety ({tech_count} technologies identified)")
    elif tech_count >= 6:
        pillar1_score = 30 + int((tech_count - 6) * 2.5)
        strengths.append(f"Good technical foundation with {tech_count} relevant technologies")
    elif tech_count >= 3:
        pillar1_score = 20 + (tech_count - 3) * 3
        weaknesses.append("Moderate technical skills; expand proficiency in modern frameworks and databases")
    else:
        pillar1_score = max(5, tech_count * 5)
        weaknesses.append("Limited technical skills detected in the document")
        recommendations.append("Add a dedicated 'Technical Skills' section categorizing Languages, Frameworks, Databases, and Tools.")

    # -------------------------------------------------------------
    # Pillar 2: Section Completeness (Max 25 points)
    # -------------------------------------------------------------
    section_score = 0
    if len(education) > 0:
        section_score += 7
        strengths.append("Education background clearly documented")
    else:
        weaknesses.append("Missing or unclear education section")
        recommendations.append("Include your university degree, major, and graduation year prominently.")

    if len(experience) > 0:
        section_score += 9
        strengths.append("Professional experience / internship history is documented")
    else:
        weaknesses.append("Missing professional experience or internship history")
        recommendations.append("List past internships, full-time positions, or open-source engineering contributions.")

    if len(projects) > 0:
        section_score += 9
        strengths.append("Engineering projects section highlighted")
    else:
        weaknesses.append("Missing or sparse personal/academic projects")
        recommendations.append("Showcase at least 2-3 significant projects with tech stacks and GitHub repository links.")

    pillar2_score = min(25, section_score)

    # -------------------------------------------------------------
    # Pillar 3: Soft Skills & Team Dynamics (Max 15 points)
    # -------------------------------------------------------------
    soft_count = len(soft_skills)
    if soft_count >= 4:
        pillar3_score = 15
        strengths.append(f"Well-rounded interpersonal & leadership skills ({soft_count} found)")
    elif soft_count >= 2:
        pillar3_score = 10
    elif soft_count == 1:
        pillar3_score = 6
        weaknesses.append("Few soft skills detected")
    else:
        pillar3_score = 3
        weaknesses.append("No explicit soft skills (e.g. Communication, Leadership, Problem Solving) detected")
        recommendations.append("Highlight soft skills such as Teamwork, Cross-functional Collaboration, and Problem Solving.")

    # -------------------------------------------------------------
    # Pillar 4: Action Verbs, Metrics & Keyword Depth (Max 20 points)
    # -------------------------------------------------------------
    matched_verbs = [v for v in ACTION_VERBS if re.search(rf"\b{v}\b", text_lower)]
    verb_count = len(matched_verbs)
    
    # Check for quantitative impact / numerical metrics (e.g., 30%, 100k, $50k, 5x, 10ms)
    has_metrics = bool(re.search(r"\b\d+(?:%|x|k|\+|ms|s|gb|mb)?\b", text_lower))

    metric_score = 0
    if verb_count >= 6:
        metric_score += 10
        strengths.append(f"Strong action-oriented phrasing used ({verb_count} distinct action verbs)")
    elif verb_count >= 3:
        metric_score += 7
    else:
        metric_score += 3
        recommendations.append("Use strong action verbs like 'Architected', 'Optimized', 'Automated' to start bullet points.")

    if has_metrics:
        metric_score += 10
        strengths.append("Quantifiable metrics and achievements present in descriptions")
    else:
        weaknesses.append("Lack of quantifiable metrics/percentages illustrating impact")
        recommendations.append("Quantify your impact with concrete numbers (e.g., 'reduced query latency by 45%', 'handled 10k requests/sec').")

    pillar4_score = min(20, metric_score)

    # -------------------------------------------------------------
    # Total ATS Score (0 - 100)
    # -------------------------------------------------------------
    total_ats = round(pillar1_score + pillar2_score + pillar3_score + pillar4_score)
    total_ats = max(10, min(99, total_ats))

    # Identify missing industry benchmark skills
    current_skills_set = set(s.lower() for s in (tech_skills + soft_skills))
    missing_skills = [
        skill for skill in CORE_BENCHMARK_SKILLS
        if skill.lower() not in current_skills_set
    ][:7]

    if missing_skills:
        recommendations.append(f"Consider acquiring in-demand skills: {', '.join(missing_skills[:4])}.")

    # Fallbacks if list is short
    if not recommendations:
        recommendations.append("Keep resume updated with your most recent cloud and distributed systems certifications.")

    return {
        "atsScore": total_ats,
        "scoreBreakdown": {
            "technicalSkills": pillar1_score,
            "sectionCompleteness": pillar2_score,
            "softSkills": pillar3_score,
            "actionMetrics": pillar4_score
        },
        "strengths": strengths[:5],
        "weaknesses": weaknesses[:5],
        "technicalSkills": tech_skills,
        "softSkills": soft_skills,
        "missingSkills": missing_skills,
        "recommendations": recommendations[:5]
    }
