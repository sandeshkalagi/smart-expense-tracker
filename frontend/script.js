const API="http://localhost:8081/expenses";

let pieChart;
let monthlyChart;



function loadExpenses(){

    fetch(API)
        .then(res=>res.json())
        .then(data=>{

            let table=document.getElementById("expenseTable");
            table.innerHTML="";

            data.forEach((exp,index)=>{

                table.innerHTML+=`
<tr>
<td>${index+1}</td>
<td>${exp.title}</td>
<td>₹${exp.amount}</td>
<td>${exp.date}</td>
<td>
<button onclick="deleteExpense(${exp.id})">Delete</button>
</td>
</tr>
`;

            });

        });

}



function loadTotal(){

    fetch(API+"/total")
        .then(res=>res.json())
        .then(total=>{
            document.getElementById("totalAmount").innerText="₹"+total;
        });

}



function loadStats(){

    fetch(API)
        .then(res=>res.json())
        .then(data=>{

            let currentMonth=new Date().getMonth()+1;
            let monthTotal=0;

            data.forEach(exp=>{

                let expMonth=new Date(exp.date).getMonth()+1;

                if(expMonth===currentMonth){
                    monthTotal+=exp.amount;
                }

            });

            document.getElementById("monthTotal").innerText="₹"+monthTotal;


            let categories={};

            data.forEach(exp=>{
                categories[exp.category]=(categories[exp.category]||0)+exp.amount;
            });

            let topCategory="-";
            let max=0;

            for(let cat in categories){

                if(categories[cat]>max){
                    max=categories[cat];
                    topCategory=cat;
                }

            }

            document.getElementById("topCategory").innerText=topCategory;

        });

}



function loadChart(){

    fetch(API)
        .then(res=>res.json())
        .then(data=>{

            let categories={};

            data.forEach(exp=>{
                categories[exp.category]=(categories[exp.category]||0)+exp.amount;
            });

            let labels=Object.keys(categories);
            let values=Object.values(categories);

            if(pieChart){
                pieChart.destroy();
            }

            const ctx=document.getElementById("expenseChart");

            pieChart=new Chart(ctx,{

                type:"pie",

                data:{
                    labels:labels,
                    datasets:[{
                        data:values,
                        backgroundColor:[
                            "#6366f1",
                            "#22c55e",
                            "#f59e0b",
                            "#ef4444",
                            "#06b6d4",
                            "#a855f7"
                        ]
                    }]
                }

            });

        });

}



function loadMonthlyChart(){

    fetch(API)
        .then(res=>res.json())
        .then(data=>{

            let months={};

            data.forEach(exp=>{

                let month=new Date(exp.date).getMonth()+1;

                months[month]=(months[month]||0)+exp.amount;

            });

            let labels=Object.keys(months);
            let values=Object.values(months);

            const ctx=document.getElementById("monthlyChart");

            if(monthlyChart){
                monthlyChart.destroy();
            }

            monthlyChart=new Chart(ctx,{

                type:"bar",

                data:{
                    labels:labels,
                    datasets:[{
                        label:"Monthly Spending",
                        data:values,
                        backgroundColor:"#6366f1"
                    }]
                }

            });

        });

}



function addExpense(){

    let expense={
        title:document.getElementById("expense").value,
        amount:parseFloat(document.getElementById("amount").value),
        category:document.getElementById("category").value,
        date:document.getElementById("date").value
    };

    fetch(API,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(expense)
    })
        .then(()=>{

            loadExpenses();
            loadTotal();
            loadStats();
            loadChart();
            loadMonthlyChart();

        });

}



function deleteExpense(id){

    fetch(API+"/"+id,{
        method:"DELETE"
    })
        .then(()=>{

            loadExpenses();
            loadTotal();
            loadStats();
            loadChart();
            loadMonthlyChart();

        });

}



loadExpenses();
loadTotal();
loadStats();
loadChart();
loadMonthlyChart();