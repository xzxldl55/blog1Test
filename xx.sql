select * from user where id in(
    select min(id) 
    from user 
    where name = 'Java3y' and pv = 20 and time='7-25' group by name,pv,time;
)