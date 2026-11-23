
const content = document.getElementById("content");
const modalRoot = document.getElementById("modalRoot");
const topTitle = document.getElementById("topTitle");

let leads = JSON.parse(localStorage.getItem("crmLeads")) || [
    { id: 101, name: "Riya Sharma", phone: "9876543210", email: "riya@example.com", destination: "Bali", budget: 85000, stage: "New", followup: "2026-11-24" },
    { id: 102, name: "Amit Patel", phone: "9876543211", email: "amit@example.com", destination: "Dubai", budget: 65000, stage: "Contacted", followup: "2026-11-25" },
    { id: 103, name: "Neha Shah", phone: "9876543212", email: "neha@example.com", destination: "Maldives", budget: 120000, stage: "Qualified", followup: "2026-11-26" },
    { id: 104, name: "Karan Mehta", phone: "9876543213", email: "karan@example.com", destination: "Thailand", budget: 55000, stage: "Converted", followup: "2026-11-20" },
    { id: 105, name: "Pooja Desai", phone: "9876543214", email: "pooja@example.com", destination: "Europe", budget: 200000, stage: "Contacted", followup: "2026-11-23" },
    { id: 106, name: "Rahul Joshi", phone: "9876543215", email: "rahul@example.com", destination: "Singapore", budget: 70000, stage: "New", followup: "2026-11-27" }
];

let customers = JSON.parse(localStorage.getItem("crmCustomers")) || [
    { name: "Karan Mehta", phone: "9876543213", email: "karan@example.com", destination: "Thailand", bookings: 2, value: 110000 },
    { name: "Maya Shah", phone: "9876543216", email: "maya@example.com", destination: "Switzerland", bookings: 3, value: 350000 },
    { name: "Dev Patel", phone: "9876543217", email: "dev@example.com", destination: "Dubai", bookings: 1, value: 65000 }
];

let followups = JSON.parse(localStorage.getItem("crmFollowups")) || [
    { id: 1, name: "Amit Patel", task: "Discuss Dubai package", date: "2026-11-25", status: "Pending" },
    { id: 2, name: "Pooja Desai", task: "Send Europe itinerary", date: "2026-11-23", status: "Pending" },
    { id: 3, name: "Neha Shah", task: "Confirm Maldives package", date: "2026-11-26", status: "Pending" }
];

function saveData() {
    localStorage.setItem("crmLeads", JSON.stringify(leads));
    localStorage.setItem("crmCustomers", JSON.stringify(customers));
    localStorage.setItem("crmFollowups", JSON.stringify(followups));
}

function money(n) {
    return "₹" + Number(n).toLocaleString("en-IN");
}

function badge(status) {
    return `<span class="badge ${status.toLowerCase().replaceAll(" ", "-")}">${status}</span>`;
}

function pageHeader(title, subtitle, button = "") {
    return `<div class="page-header">
        <div><h2>${title}</h2><p>${subtitle}</p></div>${button}
    </div>`;
}

function renderDashboard() {
    const converted = leads.filter(l => l.stage === "Converted").length;
    const conversion = leads.length ? Math.round(converted / leads.length * 100) : 0;

    content.innerHTML = `
        ${pageHeader("Dashboard", "Your travel sales and customer overview",
        `<button class="primary-btn" onclick="openLeadModal()">+ Add Lead</button>`)}
        
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-top">Total Leads</div><h2>${leads.length}</h2><small>All potential travellers</small></div>
            <div class="stat-card"><div class="stat-top">Customers</div><h2>${customers.length}</h2><small>Existing customers</small></div>
            <div class="stat-card"><div class="stat-top">Conversion Rate</div><h2>${conversion}%</h2><small>Leads converted</small></div>
            <div class="stat-card"><div class="stat-top">Pending Follow-ups</div><h2>${followups.filter(f => f.status === "Pending").length}</h2><small>Tasks to complete</small></div>
        </div>

        <div class="panel">
            <div class="panel-header"><h3>Recent Leads</h3><button onclick="navigate('leads')">View All</button></div>
            ${leadTable(leads.slice(0,5))}
        </div>

        <div class="panel">
            <div class="panel-header"><h3>Upcoming Follow-ups</h3><button onclick="navigate('followups')">View All</button></div>
            ${followupTable(followups.filter(f => f.status === "Pending").slice(0,5))}
        </div>
    `;
}

function renderLeads() {
    content.innerHTML = `
        ${pageHeader("Leads", "Manage potential travellers and sales opportunities",
        `<button class="primary-btn" onclick="openLeadModal()">+ Add Lead</button>`)}
        <div class="panel">
            <div class="panel-header"><h3>Lead Directory</h3>
            <select onchange="filterLeads(this.value)">
                <option value="All">All Stages</option>
                <option>New</option><option>Contacted</option><option>Qualified</option><option>Converted</option><option>Lost</option>
            </select></div>
            <div id="leadTable">${leadTable(leads)}</div>
        </div>
    `;
}

function leadTable(list) {
    return `<table>
        <thead><tr><th>Name</th><th>Contact</th><th>Destination</th><th>Budget</th><th>Stage</th><th>Follow-up</th><th>Action</th></tr></thead>
        <tbody>${list.map(l => `<tr>
            <td><strong>${l.name}</strong></td>
            <td>${l.phone}<br><small>${l.email}</small></td>
            <td>${l.destination}</td><td>${money(l.budget)}</td>
            <td>${badge(l.stage)}</td><td>${l.followup}</td>
            <td><button onclick="editLeadStage(${l.id})">Update</button></td>
        </tr>`).join("")}</tbody>
    </table>`;
}

function filterLeads(stage) {
    document.getElementById("leadTable").innerHTML = leadTable(stage === "All" ? leads : leads.filter(l => l.stage === stage));
}

function editLeadStage(id) {
    const l = leads.find(x => x.id === id);
    if (!l) return;
    modalRoot.innerHTML = `<div class="modal-overlay" onclick="closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-header"><h3>Update Lead</h3><button onclick="modalRoot.innerHTML=''">✕</button></div>
            <form onsubmit="saveLeadStage(event,${id})">
                <div class="form-grid">
                    <div><label>Lead</label><input value="${l.name}" disabled></div>
                    <div><label>Stage</label><select name="stage">
                        ${["New","Contacted","Qualified","Converted","Lost"].map(s => `<option ${s===l.stage?"selected":""}>${s}</option>`).join("")}
                    </select></div>
                </div>
                <button class="primary-btn">Update Stage</button>
            </form>
        </div></div>`;
}

function saveLeadStage(e,id) {
    e.preventDefault();
    const stage = new FormData(e.target).get("stage");
    const l = leads.find(x => x.id === id);
    if (l) {
        l.stage = stage;
        if (stage === "Converted" && !customers.some(c => c.name === l.name)) {
            customers.push({ name:l.name, phone:l.phone, email:l.email, destination:l.destination, bookings:1, value:l.budget });
        }
    }
    saveData();
    modalRoot.innerHTML = "";
    renderLeads();
}

function openLeadModal() {
    modalRoot.innerHTML = `<div class="modal-overlay" onclick="closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()">
            <div class="modal-header"><h3>Add New Lead</h3><button onclick="modalRoot.innerHTML=''">✕</button></div>
            <form onsubmit="addLead(event)">
                <div class="form-grid">
                    <div><label>Full Name</label><input name="name" required></div>
                    <div><label>Phone</label><input name="phone" required></div>
                    <div><label>Email</label><input name="email" type="email"></div>
                    <div><label>Destination</label><input name="destination" required></div>
                    <div><label>Budget (₹)</label><input name="budget" type="number" required></div>
                    <div><label>Stage</label><select name="stage"><option>New</option><option>Contacted</option><option>Qualified</option></select></div>
                    <div><label>Follow-up Date</label><input name="followup" type="date" required></div>
                </div>
                <button class="primary-btn">Save Lead</button>
            </form>
        </div></div>`;
}

function addLead(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    leads.unshift({
        id: Date.now(),
        name: f.get("name"),
        phone: f.get("phone"),
        email: f.get("email"),
        destination: f.get("destination"),
        budget: Number(f.get("budget")),
        stage: f.get("stage"),
        followup: f.get("followup")
    });
    saveData();
    modalRoot.innerHTML = "";
    renderLeads();
}

function renderCustomers() {
    content.innerHTML = `
        ${pageHeader("Customers", "Your existing traveller database")}
        <div class="stats-grid">
            <div class="stat-card"><div class="stat-top">Total Customers</div><h2>${customers.length}</h2></div>
            <div class="stat-card"><div class="stat-top">Total Bookings</div><h2>${customers.reduce((s,c)=>s+c.bookings,0)}</h2></div>
            <div class="stat-card"><div class="stat-top">Customer Value</div><h2>${money(customers.reduce((s,c)=>s+c.value,0))}</h2></div>
            <div class="stat-card"><div class="stat-top">Repeat Customers</div><h2>${customers.filter(c=>c.bookings>1).length}</h2></div>
        </div>
        <div class="panel">
            <div class="panel-header"><h3>Customer Directory</h3></div>
            <table><thead><tr><th>Name</th><th>Contact</th><th>Last Destination</th><th>Bookings</th><th>Total Value</th></tr></thead>
            <tbody>${customers.map(c=>`<tr>
                <td><strong>${c.name}</strong></td><td>${c.phone}<br><small>${c.email}</small></td>
                <td>${c.destination}</td><td>${c.bookings}</td><td>${money(c.value)}</td>
            </tr>`).join("")}</tbody></table>
        </div>`;
}

function renderFollowups() {
    content.innerHTML = `
        ${pageHeader("Follow-ups", "Track calls, emails and customer reminders",
        `<button class="primary-btn" onclick="openFollowupModal()">+ Add Follow-up</button>`)}
        <div class="panel"><div class="panel-header"><h3>Follow-up Tasks</h3>
        <select onchange="filterFollowups(this.value)" id="followFilter"><option>All</option><option>Pending</option><option>Completed</option></select></div>
        <div id="followTable">${followupTable(followups)}</div></div>`;
}

function followupTable(list) {
    if (!list.length) return `<p style="padding:20px">No follow-ups found.</p>`;
    return `<table><thead><tr><th>Customer</th><th>Task</th><th>Date</th><th>Status</th><th>Action</th></tr></thead>
    <tbody>${list.map(f=>`<tr><td><strong>${f.name}</strong></td><td>${f.task}</td><td>${f.date}</td>
        <td>${badge(f.status)}</td><td>${f.status==="Pending"?`<button onclick="completeFollowup(${f.id})">Complete</button>`:"—"}</td>
    </tr>`).join("")}</tbody></table>`;
}

function filterFollowups(status) {
    document.getElementById("followTable").innerHTML = followupTable(status==="All" ? followups : followups.filter(f=>f.status===status));
}

function completeFollowup(id) {
    const f = followups.find(x=>x.id===id);
    if (f) f.status = "Completed";
    saveData();
    renderFollowups();
}

function openFollowupModal() {
    modalRoot.innerHTML = `<div class="modal-overlay" onclick="closeModal(event)">
        <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header"><h3>Add Follow-up</h3><button onclick="modalRoot.innerHTML=''">✕</button></div>
        <form onsubmit="addFollowup(event)">
            <div class="form-grid">
                <div><label>Customer</label><input name="name" required></div>
                <div><label>Task</label><input name="task" required></div>
                <div><label>Date</label><input name="date" type="date" required></div>
            </div>
            <button class="primary-btn">Save Follow-up</button>
        </form></div></div>`;
}

function addFollowup(e) {
    e.preventDefault();
    const f = new FormData(e.target);
    followups.unshift({id:Date.now(),name:f.get("name"),task:f.get("task"),date:f.get("date"),status:"Pending"});
    saveData();
    modalRoot.innerHTML="";
    renderFollowups();
}

function renderPipeline() {
    const stages = ["New","Contacted","Qualified","Converted","Lost"];
    content.innerHTML = `
        ${pageHeader("Sales Pipeline", "Track potential bookings through each stage")}
        <div class="pipeline-grid" style="grid-template-columns:repeat(5,minmax(180px,1fr));overflow-x:auto">
            ${stages.map(stage=>`<div class="panel" style="min-width:180px">
                <div class="panel-header"><h3>${stage}</h3><span class="badge">${leads.filter(l=>l.stage===stage).length}</span></div>
                ${leads.filter(l=>l.stage===stage).map(l=>`<div class="room-tile" style="margin-bottom:12px">
                    <strong>${l.name}</strong><p>${l.destination}</p><p>${money(l.budget)}</p>
                    <button onclick="editLeadStage(${l.id})">Update</button>
                </div>`).join("") || `<small>No leads</small>`}
            </div>`).join("")}
        </div>`;
}

function navigate(page) {
    document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
    const titles={dashboard:"Dashboard",leads:"Leads",customers:"Customers",followups:"Follow-ups",pipeline:"Pipeline"};
    topTitle.textContent=titles[page]||page;
    if(page==="dashboard")renderDashboard();
    if(page==="leads")renderLeads();
    if(page==="customers")renderCustomers();
    if(page==="followups")renderFollowups();
    if(page==="pipeline")renderPipeline();
}

function closeModal(e) {
    if(e.target.classList.contains("modal-overlay"))modalRoot.innerHTML="";
}

document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));

saveData();
renderDashboard();
