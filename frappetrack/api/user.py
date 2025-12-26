import frappe
from frappe import _

@frappe.whitelist(allow_guest=False)
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
