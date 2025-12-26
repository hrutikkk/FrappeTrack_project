import frappe

@frappe.whitelist()
def get_employee_profile():
    """
    Returns the employee details of the logged-in user.
    """
    try:
        user = frappe.session.user

        employee = frappe.db.get_value(
            "Employee",
            {"user_id": user},
            ["name", "designation", "image"],
            as_dict=True
        )

        if employee and employee.get("image"):
            employee["image"] = frappe.utils.get_url(employee["image"])

        return {
            "success": True,
            "user": {
                "name": frappe.get_value("User", user, "full_name"),
                "email": frappe.get_value("User", user, "email"),
                "employee": employee
            }
        }

    except Exception as e:
        return {
            "success": False,
            "message": "Unable to fetch profile",
            "error": str(e)
        }


# import frappe

# @frappe.whitelist()
# def get_employee_profile():
#     """
#     Returns employee details of the authenticated user
#     Authentication is handled automatically by Frappe
#     via Authorization: Bearer api_key:api_secret
#     """

#     # Frappe already authenticated the request
#     user = frappe.session.user

#     if user == "Guest":
#         frappe.throw("Unauthorized")

#     # Fetch user basic info
#     user_info = frappe.db.get_value(
#         "User",
#         user,
#         ["full_name", "email"],
#         as_dict=True
#     )

#     # Fetch linked employee
#     employee = frappe.db.get_value(
#         "Employee",
#         {"user_id": user},
#         ["name", "designation", "image"],
#         as_dict=True
#     )

#     if employee and employee.get("image"):
#         employee["image"] = frappe.utils.get_url(employee["image"])

#     return {
#         "success": True,
#         "user": {
#             "name": user_info.full_name,
#             "email": user_info.email,
#             "employee": employee
#         }
#     }
