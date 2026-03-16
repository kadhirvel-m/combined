(function () {
  "use strict";

  var LOCAL_KEY = "paperx.pyq.records.v1";

  function getApiBase() {
    var base = (window.API_BASE || "http://127.0.0.1:8000").trim();
    return base.replace(/\/$/, "");
  }

  function qs(id) {
    return document.getElementById(id);
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function byText(a, b) {
    return String(a || "").localeCompare(String(b || ""));
  }

  function uniqByName(items) {
    var seen = {};
    return (items || []).filter(function (item) {
      var key = String((item && item.name) || "").toUpperCase();
      if (!key || seen[key]) {
        return false;
      }
      seen[key] = true;
      return true;
    });
  }

  async function fetchJson(path, opts) {
    var url = getApiBase() + path;
    var response = await fetch(url, opts || {});
    if (!response.ok) {
      var detail = "Request failed";
      try {
        var err = await response.json();
        detail = err && (err.detail || err.message) ? (err.detail || err.message) : detail;
      } catch (_ignored) {
        detail = response.status + " " + response.statusText;
      }
      throw new Error(detail);
    }
    return response.json();
  }

  async function listColleges() {
    var rows = await fetchJson("/api/colleges");
    return Array.isArray(rows) ? rows.slice().sort(function (a, b) { return byText(a.name, b.name); }) : [];
  }

  async function getCollege(collegeId) {
    if (!collegeId) {
      return null;
    }
    return fetchJson("/api/colleges/" + encodeURIComponent(collegeId));
  }

  function flattenDepartments(collegeDetails) {
    var out = [];
    var degrees = (collegeDetails && collegeDetails.degrees) || [];
    degrees.forEach(function (degree) {
      var depts = (degree && degree.departments) || [];
      depts.forEach(function (dept) {
        out.push({
          id: dept.id,
          name: dept.name,
          degree_id: degree.id,
          degree_name: degree.name
        });
      });
    });
    return uniqByName(out).sort(function (a, b) { return byText(a.name, b.name); });
  }

  function fillSelect(selectEl, placeholder, rows, valueKey, labelKey) {
    if (!selectEl) {
      return;
    }
    selectEl.innerHTML = "";
    var placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = placeholder;
    selectEl.appendChild(placeholderOption);

    (rows || []).forEach(function (item) {
      var option = document.createElement("option");
      option.value = String(item[valueKey] || "");
      option.textContent = String(item[labelKey] || "");
      selectEl.appendChild(option);
    });
  }

  function readLocalRecords() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (_ignored) {
      return [];
    }
  }

  function writeLocalRecords(records) {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(records || []));
  }

  function makeId() {
    return "pyq-" + Date.now() + "-" + Math.floor(Math.random() * 100000);
  }

  function normalizeRecord(input) {
    var now = new Date().toISOString();
    return {
      id: input.id || makeId(),
      title: String(input.title || "").trim(),
      subject: String(input.subject || "").trim(),
      exam_year: Number(input.exam_year || 0) || new Date().getFullYear(),
      semester: String(input.semester || "").trim(),
      exam_type: String(input.exam_type || "").trim(),
      college_id: String(input.college_id || "").trim(),
      college_name: String(input.college_name || "").trim(),
      degree_id: String(input.degree_id || "").trim(),
      degree_name: String(input.degree_name || "").trim(),
      department_id: String(input.department_id || "").trim(),
      department_name: String(input.department_name || "").trim(),
      file_name: String(input.file_name || "").trim(),
      file_url: String(input.file_url || "").trim(),
      notes: String(input.notes || "").trim(),
      uploaded_by: String(input.uploaded_by || "").trim(),
      status: String(input.status || "active").trim(),
      created_at: input.created_at || now,
      updated_at: now
    };
  }

  function filterRecords(records, filters) {
    var f = filters || {};
    return (records || []).filter(function (row) {
      if (f.college_id && String(row.college_id) !== String(f.college_id)) {
        return false;
      }
      if (f.degree_id && String(row.degree_id) !== String(f.degree_id)) {
        return false;
      }
      if (f.department_id && String(row.department_id) !== String(f.department_id)) {
        return false;
      }
      if (f.query) {
        var q = String(f.query).toLowerCase();
        var blob = [row.title, row.subject, row.college_name, row.degree_name, row.department_name, row.exam_type]
          .join(" ")
          .toLowerCase();
        if (blob.indexOf(q) === -1) {
          return false;
        }
      }
      return true;
    });
  }

  async function listRecords(filters) {
    try {
      var url = new URL(getApiBase() + "/api/pyq");
      var f = filters || {};
      ["college_id", "degree_id", "department_id", "query"].forEach(function (key) {
        if (f[key]) {
          url.searchParams.set(key, f[key]);
        }
      });
      var remoteRes = await fetch(url.toString());
      if (remoteRes.ok) {
        var payload = await remoteRes.json();
        var rows = Array.isArray(payload) ? payload : (Array.isArray(payload.items) ? payload.items : []);
        return { source: "api", rows: rows };
      }
    } catch (_ignored) {
    }

    var localRows = filterRecords(readLocalRecords(), filters)
      .sort(function (a, b) { return byText(b.created_at, a.created_at); });
    return { source: "local", rows: localRows };
  }

  async function saveRecord(input) {
    var normalized = normalizeRecord(input);

    try {
      var response = await fetch(getApiBase() + "/api/pyq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalized)
      });
      if (response.ok) {
        var created = await response.json();
        return { source: "api", row: created };
      }
    } catch (_ignored) {
    }

    var records = readLocalRecords();
    records.push(normalized);
    writeLocalRecords(records);
    return { source: "local", row: normalized };
  }

  async function updateRecord(recordId, patch) {
    if (!recordId) {
      throw new Error("Missing record id");
    }

    try {
      var apiResp = await fetch(getApiBase() + "/api/pyq/" + encodeURIComponent(recordId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch || {})
      });
      if (apiResp.ok) {
        return { source: "api", row: await apiResp.json() };
      }
    } catch (_ignored) {
    }

    var rows = readLocalRecords();
    var next = rows.map(function (row) {
      if (String(row.id) !== String(recordId)) {
        return row;
      }
      return normalizeRecord(Object.assign({}, row, patch || {}, { id: row.id, created_at: row.created_at }));
    });
    writeLocalRecords(next);
    var updated = next.find(function (r) { return String(r.id) === String(recordId); }) || null;
    return { source: "local", row: updated };
  }

  async function deleteRecord(recordId) {
    if (!recordId) {
      throw new Error("Missing record id");
    }

    try {
      var apiResp = await fetch(getApiBase() + "/api/pyq/" + encodeURIComponent(recordId), {
        method: "DELETE"
      });
      if (apiResp.ok) {
        return { source: "api" };
      }
    } catch (_ignored) {
    }

    var rows = readLocalRecords().filter(function (row) {
      return String(row.id) !== String(recordId);
    });
    writeLocalRecords(rows);
    return { source: "local" };
  }

  async function wireAcademicCascade(config) {
    var collegeSelect = config.collegeSelect;
    var degreeSelect = config.degreeSelect;
    var departmentSelect = config.departmentSelect;
    var onChange = config.onChange || function () {};

    var colleges = await listColleges();
    fillSelect(collegeSelect, "Select college", colleges, "id", "name");

    var collegeDetails = null;
    var degrees = [];
    var departments = [];

    function setDegrees() {
      fillSelect(degreeSelect, "Select degree", degrees, "id", "name");
    }

    function setDepartments() {
      var selectedDegreeId = degreeSelect && degreeSelect.value ? degreeSelect.value : "";
      var list = departments;
      if (selectedDegreeId) {
        list = departments.filter(function (d) {
          return String(d.degree_id) === String(selectedDegreeId);
        });
      }
      fillSelect(departmentSelect, "Select department", list, "id", "name");
    }

    async function loadCollegeDetails(collegeId) {
      degrees = [];
      departments = [];
      setDegrees();
      setDepartments();
      collegeDetails = null;

      if (!collegeId) {
        onChange({ colleges: colleges, degrees: degrees, departments: departments, college: null, degree: null, department: null });
        return;
      }

      collegeDetails = await getCollege(collegeId);
      degrees = ((collegeDetails && collegeDetails.degrees) || []).slice().sort(function (a, b) { return byText(a.name, b.name); });
      departments = flattenDepartments(collegeDetails);
      setDegrees();
      setDepartments();

      onChange({ colleges: colleges, degrees: degrees, departments: departments, college: selectedCollege(), degree: null, department: null });
    }

    function selectedCollege() {
      var cid = collegeSelect && collegeSelect.value ? collegeSelect.value : "";
      return colleges.find(function (c) { return String(c.id) === String(cid); }) || null;
    }

    function selectedDegree() {
      var did = degreeSelect && degreeSelect.value ? degreeSelect.value : "";
      return degrees.find(function (d) { return String(d.id) === String(did); }) || null;
    }

    function selectedDepartment() {
      var depid = departmentSelect && departmentSelect.value ? departmentSelect.value : "";
      var list = departments;
      var selectedDeg = selectedDegree();
      if (selectedDeg) {
        list = list.filter(function (d) { return String(d.degree_id) === String(selectedDeg.id); });
      }
      return list.find(function (d) { return String(d.id) === String(depid); }) || null;
    }

    collegeSelect.addEventListener("change", async function () {
      await loadCollegeDetails(collegeSelect.value);
    });

    degreeSelect.addEventListener("change", function () {
      setDepartments();
      onChange({ colleges: colleges, degrees: degrees, departments: departments, college: selectedCollege(), degree: selectedDegree(), department: selectedDepartment() });
    });

    departmentSelect.addEventListener("change", function () {
      onChange({ colleges: colleges, degrees: degrees, departments: departments, college: selectedCollege(), degree: selectedDegree(), department: selectedDepartment() });
    });

    if (config.initialCollegeId) {
      collegeSelect.value = String(config.initialCollegeId);
      await loadCollegeDetails(config.initialCollegeId);
    }

    return {
      getSelected: function () {
        return {
          college: selectedCollege(),
          degree: selectedDegree(),
          department: selectedDepartment(),
          collegeDetails: collegeDetails
        };
      }
    };
  }

  window.PYQ = {
    getApiBase: getApiBase,
    qs: qs,
    escapeHtml: escapeHtml,
    listColleges: listColleges,
    getCollege: getCollege,
    wireAcademicCascade: wireAcademicCascade,
    listRecords: listRecords,
    saveRecord: saveRecord,
    updateRecord: updateRecord,
    deleteRecord: deleteRecord,
    filterRecords: filterRecords,
    readLocalRecords: readLocalRecords
  };

  if (typeof window.escapeHtml !== "function") {
    window.escapeHtml = escapeHtml;
  }
})();
