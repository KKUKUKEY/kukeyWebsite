# 활동 공유 및 모집 게시물 수정

상태: 진행 중
할당: 현
날짜: 2026년 7월 8일
메소드: PATCH
권한: 게시물 작성자
카테고리: 회원

지정된 id의 게시물 탐색, 수정

**Routing**

```jsx
/api/activity-update
```

**Headers Request**

```jsx
Authorization:string, //ex)"Bearer eyJhbGciOi..."
```

**Request**

```jsx
{
	id:number,
	title:string,
	text:string,
	status:string,//RECRUITING(모집중),COMPLETED(모집완료),DONE(활동종료)
	techStacks:string[],
	startDate:string,
	endDate:string,
	maxParticipants:number,
}
```

**Response**

```jsx
{
	result:boolean,
	message:string,
}
```

**Example**

```jsx
{
	result:true,
	message:"데이터 수정 완료",
}
```

**Error**

```jsx
{result:false,message:"유효하지 않은 이메일입니다"}
```