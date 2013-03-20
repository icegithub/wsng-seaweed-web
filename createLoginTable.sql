create table if not exists tb_login(
       email char(20) not null,
       password char(20) not null
);

insert into tb_login values("icecream@gmail.com", "icecream");
